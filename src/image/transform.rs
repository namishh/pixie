extern crate wasm_bindgen;
use super::Action;
use super::Image;
use std::cmp;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
impl Image {
    pub fn rotate(&mut self, clockwise: bool) {
        let (w, h) = (self.width as usize, self.height as usize);

        let mut new_pixels = vec![0_u8; w * h * 4];
        let mut new_x;
        let mut new_y;
        let mut new_idx: usize;
        let mut current_idx: usize;

        for row in 0..h {
            for col in 0..w {
                new_x = if clockwise { h - 1 - row } else { row };
                new_y = if clockwise { col } else { w - 1 - col };
                new_idx = new_y * h + new_x;
                current_idx = row * w + col;

                new_pixels[new_idx * 4 + 0] = self.pixels[current_idx * 4 + 0];
                new_pixels[new_idx * 4 + 1] = self.pixels[current_idx * 4 + 1];
                new_pixels[new_idx * 4 + 2] = self.pixels[current_idx * 4 + 2];
                new_pixels[new_idx * 4 + 3] = self.pixels[current_idx * 4 + 3];
            }
        }
        self.pixels = new_pixels;
        self.width = h as u32;
        self.height = w as u32;
        self.last_action = Action::Rotate
    }

    // iterating through half of the rows, swapping pixels between the top and bottom rows.
    pub fn flip_v(&mut self) {
        let width = self.width as usize;
        let height = self.height as usize;
        let row_size = width * 4;

        for y in 0..height / 2 {
            let top = y * row_size;
            let bottom = (height - 1 - y) * row_size;

            for x in 0..row_size {
                self.pixels.swap(top + x, bottom + x);
            }
        }
        self.last_action = Action::Flip;
    }

    // iterate through each row, swapping pixels from the left side with those from the right side.
    pub fn flip_h(&mut self) {
        let width = self.width as usize;

        for row in self.pixels.chunks_mut(width * 4) {
            for x in 0..width / 2 {
                let left = x * 4;
                let right = (width - 1 - x) * 4;

                for i in 0..4 {
                    row.swap(left + i, right + i);
                }
            }
        }
        self.last_action = Action::Flip;
    }

    pub fn crop(&mut self, mut top_x: i32, mut top_y: i32, mut width: u32, mut height: u32) {
        // keeping dimensions in bounds
        top_x = top_x.max(0).min(self.width_bk() as i32);
        top_y = top_y.max(0).min(self.height_bk() as i32);

        width = width.min(self.width_bk);
        height = height.min(self.height_bk);

        // adjust top_x and top_y if the crop area would extend beyond the right or bottom edge of the image
        if top_x as u32 + width > self.width_bk {
            top_x = (self.width_bk - width) as i32
        }
        if top_y as u32 + height > self.height_bk {
            top_y = (self.height_bk - height) as i32
        }

        let mut new_pixels = vec![0_u8; (width * height * 4) as usize];
        let mut old_x;
        let mut old_y;
        let mut old_idx: usize;
        let mut current_idx: usize;
        for row in 0..height {
            for col in 0..width {
                old_x = top_x as u32 + col; // x/y position in original pixels vector
                old_y = top_y as u32 + row;
                old_idx = (old_y * self.width + old_x) as usize;
                current_idx = (row * width + col) as usize;
                // These lines copy each component (R, G, B, A) of the pixel from the original image to the new image.
                new_pixels[current_idx * 4 + 0] = self.pixels[old_idx * 4 + 0];
                new_pixels[current_idx * 4 + 1] = self.pixels[old_idx * 4 + 1];
                new_pixels[current_idx * 4 + 2] = self.pixels[old_idx * 4 + 2];
                new_pixels[current_idx * 4 + 3] = self.pixels[old_idx * 4 + 3];
            }
        }

        self.pixels = new_pixels;
        self.width = width;
        self.height = height;

        self.last_action = Action::Crop;
    }

    fn bilinear_interpolate(&self, x: f64, y: f64, pixel_buf: &mut Vec<u8>) {
        // coordinates of the four nearest pixels: top-left (tl), top-right (tr), bottom-left (bl), and bottom-right (br).
        let (mut tl, mut tr, mut bl, mut br) = (
            (x.floor() as u32, y.floor() as u32),
            (x.ceil() as u32, y.floor() as u32),
            (x.floor() as u32, y.ceil() as u32),
            (x.ceil() as u32, y.ceil() as u32),
        );

        let w = self.width_bk;
        let h = self.height_bk;

        // keeping the coordinates in bounds
        tl.0 = cmp::min(tl.0, h - 1);
        tl.1 = cmp::min(tl.1, w - 1);
        tr.0 = cmp::min(tr.0, h - 1);
        tr.1 = cmp::min(tr.1, w - 1);
        bl.0 = cmp::min(bl.0, h - 1);
        bl.1 = cmp::min(bl.1, w - 1);
        br.0 = cmp::min(br.0, h - 1);
        br.1 = cmp::min(br.1, w - 1); // huge shoutout to github.com/edwardwohaijun for this code

        let mut tl_pixel;
        let mut tr_pixel;
        let mut bl_pixel;
        let mut br_pixel;

        let mut x_linear1;
        let mut x_linear2;
        let mut interpolated;

        for color_channel in 0..4 {
            // lines fetch the color values for the current channel from the four corner pixels.
            tl_pixel = self.pixels_bk[((tl.0 * w + tl.1) * 4 + color_channel) as usize];
            tr_pixel = self.pixels_bk[((tr.0 * w + tr.1) * 4 + color_channel) as usize];
            bl_pixel = self.pixels_bk[((bl.0 * w + bl.1) * 4 + color_channel) as usize];
            br_pixel = self.pixels_bk[((br.0 * w + br.1) * 4 + color_channel) as usize];

            // linear interpolation in the x-direction
            x_linear1 = (br.0 as f64 - x).abs() * bl_pixel as f64
                + (x - bl.0 as f64).abs() * br_pixel as f64;
            x_linear2 = (br.0 as f64 - x).abs() * tl_pixel as f64
                + (x - bl.0 as f64).abs() * tr_pixel as f64;
            // linear interpolation in the y-direction
            interpolated =
                (y - tl.1 as f64).abs() * x_linear1 + (bl.1 as f64 - y).abs() * x_linear2; // do I really need .abs()

            // push the interpolated value to the pixel buffer
            pixel_buf.push(interpolated as u8);
        }
    }

    // thanks genai but you suck
    pub fn scale(&mut self, factor: f64) {
        if (factor - 1.0).abs() < f64::EPSILON {
            self.pixels = self.pixels_bk.clone();
            self.width = self.width_bk;
            self.height = self.height_bk;
            return;
        }
    
        let new_width = (self.width_bk as f64 * factor).round() as u32;
        let new_height = (self.height_bk as f64 * factor).round() as u32;
    
        let mut new_pixels = vec![0u8; (new_width * new_height * 4) as usize];
        
        for new_y in 0..new_height {
            for new_x in 0..new_width {
                let old_x = (new_x as f64 / factor).floor() as u32;
                let old_y = (new_y as f64 / factor).floor() as u32;
                
                let old_index = ((old_y * self.width_bk + old_x) * 4) as usize;
                let new_index = ((new_y * new_width + new_x) * 4) as usize;
                
                new_pixels[new_index..new_index + 4].copy_from_slice(&self.pixels_bk[old_index..old_index + 4]);
            }
        }
        
        self.pixels = new_pixels;
        self.width = new_width;
        self.height = new_height;
        self.last_action = Action::Scale;
    }
}

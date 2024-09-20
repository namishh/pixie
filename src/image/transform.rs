extern crate wasm_bindgen;
use crate::greet;
use crate::log;

use super::Action;
use super::Image;
use std::cmp;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
impl Image {
    pub fn degrees_rotate(&mut self, degrees: f64) {
        let rads = degrees * std::f64::consts::PI / 180.0;
        let (w, h) = (self.width_orig as f64, self.height_orig as f64);

        // Precompute sin and cos of the radians only once
        let (sin_rads, cos_rads) = (rads.sin(), rads.cos());
        let (abs_sin, abs_cos) = (sin_rads.abs(), cos_rads.abs());

        // Calculate the new image width and height
        let (new_w, new_h) = (
            (h * abs_sin + w * abs_cos).ceil() as u32,
            (h * abs_cos + w * abs_sin).ceil() as u32,
        );

        // Calculate the old and new center points
        let (old_center_x, old_center_y) = (w / 2.0, h / 2.0);
        let (new_center_x, new_center_y) = (new_w as f64 / 2.0, new_h as f64 / 2.0);

        // Allocate the new pixel buffer
        let mut new_pixels = vec![0u8; (new_w * new_h * 4) as usize];

        // Use unsafe block to avoid bounds checking inside the loop
        unsafe {
            for y in 0..new_h {
                let dy = y as f64 - new_center_y;
                for x in 0..new_w {
                    let dx = x as f64 - new_center_x;

                    // Precompute rotated source coordinates
                    let src_x = (dx * cos_rads + dy * sin_rads + old_center_x).round();
                    let src_y = (-dx * sin_rads + dy * cos_rads + old_center_y).round();

                    let dst_idx = ((y * new_w + x) * 4) as usize;

                    if src_x >= 0.0 && src_x < w && src_y >= 0.0 && src_y < h {
                        let src_idx =
                            ((src_y as u32 * self.width_orig + src_x as u32) * 4) as usize;
                        std::ptr::copy_nonoverlapping(
                            self.pixels_orig.as_ptr().add(src_idx),
                            new_pixels.as_mut_ptr().add(dst_idx),
                            4,
                        );
                    } else {
                        std::ptr::write_bytes(new_pixels.as_mut_ptr().add(dst_idx), 0, 4);
                    }
                }
            }
        }

        // Update the width, height, and pixels of the image
        self.width = new_w;
        self.height = new_h;
        self.pixels = new_pixels;
        self.last_action = Action::Rotate;
    }

    pub fn perpendicular_rotate(&mut self, clockwise: bool) {
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
        // Ensure top_x and top_y are non-negative
        top_x = top_x.max(0);
        top_y = top_y.max(0);

        // Convert top_x and top_y to u32 for easier calculations
        let top_x = top_x as u32;
        let top_y = top_y as u32;

        // Adjust width and height if they exceed image boundaries
        width = width.min(self.width_bk.saturating_sub(top_x));
        height = height.min(self.height_bk.saturating_sub(top_y));

        // Ensure we have a valid crop area
        if width == 0 || height == 0 {
            return; // No valid crop area, exit the function
        }

        let mut new_pixels = vec![0_u8; (width * height * 4) as usize];

        for row in 0..height {
            for col in 0..width {
                let old_x = top_x + col;
                let old_y = top_y + row;
                let old_idx = ((old_y * self.width_bk + old_x) * 4) as usize;
                let new_idx = ((row * width + col) * 4) as usize;

                // Copy each component (R, G, B, A) of the pixel
                new_pixels[new_idx..new_idx + 4]
                    .copy_from_slice(&self.pixels[old_idx..old_idx + 4]);
            }
        }

        self.pixels = new_pixels;
        self.width = width;
        self.height = height;
        self.last_action = Action::Crop;
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

                new_pixels[new_index..new_index + 4]
                    .copy_from_slice(&self.pixels_bk[old_index..old_index + 4]);
            }
        }

        self.pixels = new_pixels;
        self.width = new_width;
        self.height = new_height;
        self.last_action = Action::Scale;
    }
}

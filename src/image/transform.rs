extern crate wasm_bindgen;
use super::Action;
use super::Image;
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
}

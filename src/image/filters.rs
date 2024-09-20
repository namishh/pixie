extern crate wasm_bindgen;
use super::Action;
use super::Image;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
impl Image {
    pub fn grayscale(&mut self, factor: f64) {
        let factor = factor.max(0.0).min(1.0);

        for chunk in self.pixels.chunks_mut(4) {
            let r = chunk[0] as f64;
            let g = chunk[1] as f64;
            let b = chunk[2] as f64;

            let gray = 0.299 * r + 0.587 * g + 0.114 * b;
            chunk[0] = ((1.0 - factor) * r + factor * gray) as u8;
            chunk[1] = ((1.0 - factor) * g + factor * gray) as u8;
            chunk[2] = ((1.0 - factor) * b + factor * gray) as u8;
        }

        self.last_action = Action::Adjust;
    }
}

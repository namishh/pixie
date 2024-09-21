extern crate wasm_bindgen;
use super::Action;
use super::Image;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
impl Image {
    fn grayscale(&self, pixels: &mut [u8], factor: f64) {
        for chunk in pixels.chunks_mut(4) {
            let r = chunk[0] as f64;
            let g = chunk[1] as f64;
            let b = chunk[2] as f64;
            let gray = 0.299 * r + 0.587 * g + 0.114 * b;
            chunk[0] = ((1.0 - factor) * r + factor * gray) as u8;
            chunk[1] = ((1.0 - factor) * g + factor * gray) as u8;
            chunk[2] = ((1.0 - factor) * b + factor * gray) as u8;
        }
    }

    fn sepia(&self, pixels: &mut [u8], factor: f64) {
        for chunk in pixels.chunks_mut(4) {
            let r = chunk[0] as f64;
            let g = chunk[1] as f64;
            let b = chunk[2] as f64;
            let sepia_r = (0.393 * r + 0.769 * g + 0.189 * b).min(255.0);
            let sepia_g = (0.349 * r + 0.686 * g + 0.168 * b).min(255.0);
            let sepia_b = (0.272 * r + 0.534 * g + 0.131 * b).min(255.0);
            chunk[0] = ((1.0 - factor) * r + factor * sepia_r) as u8;
            chunk[1] = ((1.0 - factor) * g + factor * sepia_g) as u8;
            chunk[2] = ((1.0 - factor) * b + factor * sepia_b) as u8;
        }
    }

    fn saturation(&self, pixels: &mut [u8], factor: f64) {
        for chunk in pixels.chunks_mut(4) {
            let r = chunk[0] as f64;
            let g = chunk[1] as f64;
            let b = chunk[2] as f64;

            let gray = 0.299 * r + 0.587 * g + 0.114 * b;

            chunk[0] = ((1.0 - factor) * gray + factor * r).clamp(0.0, 255.0) as u8;
            chunk[1] = ((1.0 - factor) * gray + factor * g).clamp(0.0, 255.0) as u8;
            chunk[2] = ((1.0 - factor) * gray + factor * b).clamp(0.0, 255.0) as u8;
        }
    }

    fn brightness(&self, pixels: &mut [u8], factor: f64) {
        for chunk in pixels.chunks_mut(4) {
            for i in 0..3 {
                let new_value = chunk[i] as f64 + 255.0 * factor;
                chunk[i] = new_value.clamp(0.0, 255.0) as u8;
            }
        }
    }

    fn hue(&self, pixels: &mut [u8], shift: f64) {
        for chunk in pixels.chunks_mut(4) {
            let (h, s, l) = self.rgb_to_hsl(chunk[0], chunk[1], chunk[2]);
            let new_h = (h + shift) % 360.0;
            let (r, g, b) = self.hsl_to_rgb(new_h, s, l);
            chunk[0] = r;
            chunk[1] = g;
            chunk[2] = b;
        }
    }

    fn luminosity(&self, pixels: &mut [u8], factor: f64) {
        for chunk in pixels.chunks_mut(4) {
            let (h, s, l) = self.rgb_to_hsl(chunk[0], chunk[1], chunk[2]);
            let new_l = (l + factor).clamp(0.0, 1.0);
            let (r, g, b) = self.hsl_to_rgb(h, s, new_l);
            chunk[0] = r;
            chunk[1] = g;
            chunk[2] = b;
        }
    }

    fn contrast(&self, pixels: &mut [u8], factor: f64) {
        let factor = factor + 1.0; // Scale factor to 0-2 range
        for chunk in pixels.chunks_mut(4) {
            for i in 0..3 {
                let new_value = ((chunk[i] as f64 - 128.0) * factor + 128.0).clamp(0.0, 255.0);
                chunk[i] = new_value as u8;
            }
        }
    }

    fn sharpness(&self, pixels: &mut [u8], factor: f64) {
        // This is a simplified sharpening filter. For more advanced sharpening,
        // consider implementing a convolution filter.
        let width = self.width as usize;
        let height = self.height as usize;
        let mut sharpened = pixels.to_vec();

        for y in 1..height - 1 {
            for x in 1..width - 1 {
                for c in 0..3 {
                    let idx = (y * width + x) * 4 + c;
                    let current = pixels[idx] as f64;
                    let neighbors = [
                        pixels[((y - 1) * width + x) * 4 + c] as f64,
                        pixels[((y + 1) * width + x) * 4 + c] as f64,
                        pixels[(y * width + x - 1) * 4 + c] as f64,
                        pixels[(y * width + x + 1) * 4 + c] as f64,
                    ];
                    let neighbor_avg = neighbors.iter().sum::<f64>() / 4.0;
                    let new_value = current + (current - neighbor_avg) * factor;
                    sharpened[idx] = new_value.clamp(0.0, 255.0) as u8;
                }
            }
        }

        pixels.copy_from_slice(&sharpened);
    }

    // Helper functions for color space conversion
    fn rgb_to_hsl(&self, r: u8, g: u8, b: u8) -> (f64, f64, f64) {
        let r = r as f64 / 255.0;
        let g = g as f64 / 255.0;
        let b = b as f64 / 255.0;

        let max = r.max(g.max(b));
        let min = r.min(g.min(b));

        let mut h = 0.0;
        let mut s;
        let l = (max + min) / 2.0;

        if max == min {
            h = 0.0;
            s = 0.0;
        } else {
            let d = max - min;
            s = if l > 0.5 {
                d / (2.0 - max - min)
            } else {
                d / (max + min)
            };
            h = match max {
                x if x == r => (g - b) / d + (if g < b { 6.0 } else { 0.0 }),
                x if x == g => (b - r) / d + 2.0,
                _ => (r - g) / d + 4.0,
            };
            h /= 6.0;
        }

        (h * 360.0, s, l)
    }

    fn hsl_to_rgb(&self, h: f64, s: f64, l: f64) -> (u8, u8, u8) {
        let h = h / 360.0;

        let c = (1.0 - (2.0 * l - 1.0).abs()) * s;
        let x = c * (1.0 - ((h * 6.0) % 2.0 - 1.0).abs());
        let m = l - c / 2.0;

        let (r, g, b) = match (h * 6.0) as u8 {
            0 => (c, x, 0.0),
            1 => (x, c, 0.0),
            2 => (0.0, c, x),
            3 => (0.0, x, c),
            4 => (x, 0.0, c),
            _ => (c, 0.0, x),
        };

        (
            ((r + m) * 255.0) as u8,
            ((g + m) * 255.0) as u8,
            ((b + m) * 255.0) as u8,
        )
    }

    pub fn invert(&mut self, pixels: &mut [u8]) {
        for chunk in pixels.chunks_mut(4) {
            chunk[0] = 255 - chunk[0];
            chunk[1] = 255 - chunk[1];
            chunk[2] = 255 - chunk[2];
        }

        self.last_action = Action::Adjust;
    }

    pub fn apply_filters(&mut self, filter_data: &str) {
        let filters: Vec<(String, f64)> = serde_json::from_str(filter_data).unwrap();
        let mut temp_pixels = self.pixels_orig.clone();

        for (filter_name, factor) in filters {
            match filter_name.as_str() {
                "grayscale" => self.grayscale(&mut temp_pixels, factor),
                "sepia" => self.sepia(&mut temp_pixels, factor),
                "luminosity" => self.luminosity(&mut temp_pixels, factor),
                "contrast" => self.contrast(&mut temp_pixels, factor),
                "sharpness" => self.sharpness(&mut temp_pixels, factor),
                "hue" => self.hue(&mut temp_pixels, factor),
                "saturation" => self.saturation(&mut temp_pixels, factor),
                "brightness" => self.brightness(&mut temp_pixels, factor),
                "invert" => self.invert(&mut temp_pixels),
                // Add more filters here...
                _ => {}
            }
        }

        self.pixels = temp_pixels;
        self.last_action = Action::Adjust;
    }
}

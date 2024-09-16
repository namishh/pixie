extern crate console_error_panic_hook;
extern crate wasm_bindgen;

mod transform;

use wasm_bindgen::prelude::*;

#[derive(Copy, Clone, Debug)]
pub enum Action {
    None,
    Adjust,
    Rotate,
    Pixelate,
    Blur,
}

#[wasm_bindgen]
pub struct Image {
    width: u32,
    height: u32,
    pixels: Vec<u8>,

    pixels_bk: Vec<u8>,
    width_bk: u32,
    height_bk: u32,

    last_action: Action,
    hsi: Vec<Vec<f64>>,
    lab: Vec<f64>,
}

#[wasm_bindgen]
impl Image {
    pub fn new(w: u32, h: u32, buf: Vec<u8>) -> Image {
        Image {
            width: w,
            height: h,
            pixels: buf.clone(),

            pixels_bk: buf,
            width_bk: w,
            height_bk: h,

            last_action: Action::None,

            hsi: vec![vec![], vec![], vec![]],
            lab: vec![0_f64; 0],
        }
    }

    pub fn reuse(&mut self, w: u32, h: u32, buf: Vec<u8>) {
        self.pixels = buf.clone();
        self.width = w;
        self.height = h;

        self.pixels_bk = buf;
        self.width_bk = w;
        self.height_bk = h;
    }

    pub fn pixels(&self) -> *const u8 {
        self.pixels.as_ptr()
    }
    pub fn width(&self) -> u32 {
        self.width
    }
    pub fn height(&self) -> u32 {
        self.height
    }
    pub fn width_bk(&self) -> u32 {
        self.width_bk
    }
    pub fn height_bk(&self) -> u32 {
        self.height_bk
    }

    pub fn apply_change(&mut self) {
        self.pixels_bk = self.pixels.clone();
        self.width_bk = self.width;
        self.height_bk = self.height;
    }

    pub fn discard_change(&mut self) {
        self.pixels = self.pixels_bk.clone();
        self.width = self.width_bk;
        self.height = self.height_bk;
    }
}

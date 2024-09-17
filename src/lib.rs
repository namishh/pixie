pub mod image;
mod utils;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    log("Hello, from the wasm!");
}

#[wasm_bindgen]
pub fn get_wasm_memory() -> JsValue {
    wasm_bindgen::memory() // This will expose the memory to JS.
}
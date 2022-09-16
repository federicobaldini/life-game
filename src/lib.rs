use wasm_bindgen::prelude::*;
// use wee_alloc::WeeAlloc;

// It is important that we have #[repr(u8)], so that each cell is represented as a single byte.
// It is also important that the Dead variant is 0 and that the Alive variant is 1,
// so that it's easy count a cell's live neighbors with addition.
#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Dead = 0,
    Alive = 1,
}

// The universe has a width and a height, and a vector of cells of length width * height.
#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: Vec<Cell>,
}

// The universe can be rappresented as a flat array that lives in the WebAssembly linear memory,
// and has a byte for each cell. 0 is a dead cell and 1 is a live cell.
//
// IMPORTANT NOTE:
// Another viable design alternative would be for Rust to return a list of every cell that changed
// states after each tick, instead of exposing the whole universe to JavaScript. This way,
// JavaScript wouldn't need to iterate over the whole universe when rendering, only the relevant subset.
// The trade off is that this delta-based design is slightly more difficult to implement.
impl Universe {
  // To access the cell at a given row and column, we translate the row and column into an
  // index into the cells vector
  fn get_index(&self, row: u32, column: u32) -> usize {
      (row * self.width + column) as usize
  }

  // ...
}
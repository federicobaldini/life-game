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

  // In order to calculate the next state of a cell, it's needed to get a count of how many
  // of its neighbors are alive.
  //
  // The live_neighbor_count method uses deltas and modulo to avoid special casing the edges of the
  // universe with ifs. When applying a delta of -1, we add self.height - 1 and let the modulo do its
  // thing, rather than attempting to subtract 1. row and column can be 0, and if we attempted to
  // subtract 1 from them, there would be an unsigned integer underflow.
  fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
    let mut count = 0;
    // [self.height - 1, 0, 1].iter().cloned()
    for delta_row in [self.height - 1, 0, 1] {
      for delta_column in [self.width - 1, 0, 1] {
        if delta_row == 0 && delta_column == 0 {
          continue;
        }
        let neighbor_row = (row + delta_row) % self.height;
        let neighbor_column = (column + delta_column) % self.width;
        let index = self.get_index(neighbor_row, neighbor_column);
        count += self.cells[index] as u8;
      }
    }
    count
  }
}


use std::fmt;
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

// The state of the universe is represented as a vector of cells. To make this human readable,
// let's implement a basic text renderer. The idea is to write the universe line by line
// as text, and for each cell that is alive, print the Unicode character ◼ ("black medium square").
// For dead cells, we'll print ◻ (a "white medium square").
impl fmt::Display for Universe {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    for line in self.cells.as_slice().chunks(self.width as usize) {
      for &cell in line {
        let symbol = if cell == Cell::Dead { '◻' } else { '◼' };
        write!(f, "{}", symbol)?;
      }
      write!(f, "\n")?;
    }

    Ok(())
  }
}

// The universe can be rappresented as a flat array that lives in the WebAssembly linear memory,
// and has a byte for each cell. 0 is a dead cell and 1 is a live cell.
//
// IMPORTANT NOTE:
// Another viable design alternative would be for Rust to return a list of every cell that changed
// states after each tick, instead of exposing the whole universe to JavaScript. This way,
// JavaScript wouldn't need to iterate over the whole universe when rendering, only the relevant subset.
// The trade off is that this delta-based design is slightly more difficult to implement.
//
// Public methods, exported to JavaScript.
#[wasm_bindgen]
impl Universe {
  // constructor that initializes the universe with an interesting pattern of live and dead cells
  pub fn new() -> Universe {
    let width = 64;
    let height = 64;

    let cells = (0..width * height)
      .map(|i| {
        if i % 2 == 0 || i % 7 == 0 {
          Cell::Alive
        } else {
          Cell::Dead
        }
      })
      .collect();

    Universe {
      width,
      height,
      cells,
    }
  }

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


use std::fmt;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(module = "/web/src/shared/utils/random.ts")]
extern "C" {
    fn randomNumber(max: usize) -> usize;
}

#[derive(Clone, Copy)]
pub struct Rule {
    // Indicates for each possible number of live neighbors (0–8)
    // whether a dead cell should become alive (birth rule).
    pub birth: [u8; 9],

    // Indicates for each possible number of live neighbors (0–8)
    // whether a live cell should stay alive (survival rule).
    pub survival: [u8; 9],
}

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

impl Cell {
    fn toggle(&mut self) {
        *self = match *self {
            Cell::Dead => Cell::Alive,
            Cell::Alive => Cell::Dead,
        };
    }
}

// The universe has a width and a height, and a vector of cells of length width * height.
#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: Vec<Cell>,
    cell_age: Vec<u8>,
    population: u32,
    generation: u32,
    rule: Rule,
}

// The state of the universe is represented as a vector of cells. To make this human readable,
// let's implement a basic text renderer. The idea is to write the universe line by line
// as text, and for each cell that is alive, print the Unicode character ◼ ("black medium square").
// For dead cells, we'll print ◻ (a "white medium square").
impl fmt::Display for Universe {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        for line in self.cells.as_slice().chunks(self.width as usize) {
            for &cell in line {
                let symbol: char = if cell == Cell::Dead { '◻' } else { '◼' };
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
    pub fn new(width: u32, height: u32) -> Universe {
        let size: usize = (width * height) as usize;

        Universe {
            width,
            height,
            cells: vec![Cell::Dead; size],
            cell_age: vec![0; size],
            population: 0,
            generation: 0,
            rule: Rule {
                birth: [0, 0, 0, 1, 0, 0, 0, 0, 0],    // B3
                survival: [0, 0, 1, 1, 0, 0, 0, 0, 0], // S23
            },
        }
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn cells(&self) -> *const Cell {
        self.cells.as_ptr()
    }

    pub fn cell_age(&self) -> *const u8 {
        self.cell_age.as_ptr()
    }

    pub fn population(&self) -> u32 {
        self.population
    }

    pub fn generation(&self) -> u32 {
        self.generation
    }

    pub fn set_rule(&mut self, birth: &[u8], survival: &[u8]) {
        let mut b: [u8; 9] = [0; 9];
        let mut s: [u8; 9] = [0; 9];
        for &n in birth {
            if n < 9 {
                b[n as usize] = 1;
            }
        }
        for &n in survival {
            if n < 9 {
                s[n as usize] = 1;
            }
        }
        self.rule = Rule {
            birth: b,
            survival: s,
        };
    }

    pub fn render(&self) -> String {
        self.to_string()
    }

    // Set the width of the universe.
    //
    // Resets all cells to the dead state.
    pub fn set_width(&mut self, width: u32) {
        self.width = width;
        self.cells = (0..width * self.height).map(|_i| Cell::Dead).collect();
    }

    // Set the height of the universe.
    //
    // Resets all cells to the dead state.
    pub fn set_height(&mut self, height: u32) {
        self.height = height;
        self.cells = (0..self.width * height).map(|_i| Cell::Dead).collect();
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
        let mut count: u8 = 0;
        // [self.height - 1, 0, 1].iter().cloned()
        for delta_row in [self.height - 1, 0, 1] {
            for delta_column in [self.width - 1, 0, 1] {
                if delta_row == 0 && delta_column == 0 {
                    continue;
                }
                let neighbor_row: u32 = (row + delta_row) % self.height;
                let neighbor_column: u32 = (column + delta_column) % self.width;
                let cell_index: usize = self.get_index(neighbor_row, neighbor_column);
                count += self.cells[cell_index] as u8;
            }
        }
        count
    }

    pub fn update(&mut self) {
        let mut next: Vec<Cell> = self.cells.clone();

        for row in 0..self.height {
            for col in 0..self.width {
                let cell_index: usize = self.get_index(row, col);
                let cell: Cell = self.cells[cell_index];
                let live_neighbors: u8 = self.live_neighbor_count(row, col);

                let next_cell: Cell = match (cell, live_neighbors) {
                    // If the cell is currently alive and the number of live neighbors is listed in the survival rule,
                    // the cell stays alive.
                    (Cell::Alive, n) if self.rule.survival[n as usize] == 1 => Cell::Alive,

                    // If the cell is alive but the number of neighbors is NOT in the survival rule,
                    // it dies. The population counter is decreased.
                    (Cell::Alive, _) => {
                        if self.population > 0 {
                            self.population -= 1;
                        }
                        Cell::Dead
                    }

                    // If the cell is dead and the number of live neighbors matches the birth rule,
                    // the cell becomes alive. The population counter is increased.
                    (Cell::Dead, n) if self.rule.birth[n as usize] == 1 => {
                        self.population += 1;
                        Cell::Alive
                    }

                    // Otherwise, the cell remains in its current state (no change).
                    (otherwise, _) => otherwise,
                };

                let age: u8 = match (cell, next_cell) {
                    (Cell::Alive, Cell::Alive) => self.cell_age[cell_index].saturating_add(1),
                    (Cell::Alive, Cell::Dead) => 0,
                    (Cell::Dead, Cell::Alive) => 1,
                    _ => 0,
                };
                self.cell_age[cell_index] = age;

                next[cell_index] = next_cell;
            }
        }
        self.cells = next;
        self.generation += 1;
    }

    pub fn reset(&mut self) {
        self.cells = (0..self.width * self.height).map(|_| Cell::Dead).collect();
        self.population = 0;
        self.generation = 0;
    }

    pub fn toggle_cell(&mut self, row: u32, column: u32) {
        let cell_index = self.get_index(row, column);
        self.cells[cell_index].toggle();
    }

    // "density" must be between 0 and 100
    pub fn random(&mut self, density: usize) {
        if density <= 100 {
            self.population = 0;
            self.generation = 0;
            self.cells = (0..self.width * self.height)
                .map(|_| {
                    if randomNumber(100) < density {
                        self.population += 1;
                        Cell::Alive
                    } else {
                        Cell::Dead
                    }
                })
                .collect()
        };
    }
}

// Created another impl Universe block inside the wasm_game_of_life/src/lib.rs file without
// the #[wasm_bindgen] attribute.
// There are a few functions that have to be tested and they have not to be exposed to the JavaScript.
impl Universe {
    /// Get the dead and alive values of the entire universe.
    pub fn get_cells(&self) -> &[Cell] {
        &self.cells
    }

    /// Set cells to be alive in a universe by passing the row and column
    /// of each cell as an array.
    pub fn set_cells(&mut self, cells: &[(u32, u32)]) {
        for (row, col) in cells.iter().cloned() {
            let idx: usize = self.get_index(row, col);
            self.cells[idx] = Cell::Alive;
        }
    }
}

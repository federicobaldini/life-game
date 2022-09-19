extern crate life_game;
use life_game::Universe;
use wasm_bindgen_test::*;

#[cfg(test)]
pub fn input_spaceship() -> Universe {
  let mut universe = Universe::new(64, 64);
  universe.set_width(6);
  universe.set_height(6);
  universe.set_cells(&[(1, 2), (2, 3), (3, 1), (3, 2), (3, 3)]);
  universe
}

#[cfg(test)]
pub fn expected_spaceship() -> Universe {
  let mut universe = Universe::new(64, 64);
  universe.set_width(6);
  universe.set_height(6);
  universe.set_cells(&[(2, 1), (2, 3), (3, 2), (3, 3), (4, 2)]);
  universe
}

#[wasm_bindgen_test]
pub fn test_update() {
  // Let's create a smaller Universe with a small spaceship to test!
  let mut input_universe = input_spaceship();

  // This is what a spaceship should look like
  // after one update in the universe.
  let expected_universe = expected_spaceship();

  // Call "update" and then see if the cells in the "universe"s are the same.
  input_universe.update();
  assert_eq!(&input_universe.get_cells(), &expected_universe.get_cells());
}

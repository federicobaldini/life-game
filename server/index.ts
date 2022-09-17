import init, { InitOutput, Universe, Cell } from "life-game";

const CELL_SIZE = 5; // px
const GRID_COLOR = "#494949";
const DEAD_COLOR = "#494949";
const ALIVE_COLOR = "#fdf8d8";

init().then((wasm: InitOutput) => {
  const pre = document.getElementById("game-of-life-canvas");
  const universe = Universe.new();

  const renderLoop = () => {
    const frame_per_second: number = 10;
    setTimeout(() => {
      pre.textContent = universe.render();
      universe.update();

      requestAnimationFrame(renderLoop);
    }, 1000 / frame_per_second);
  };

  requestAnimationFrame(renderLoop);
});

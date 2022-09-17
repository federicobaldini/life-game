import init, { InitOutput, Universe, Cell } from "life-game";

const CELL_SIZE = 5; // px
const GRID_COLOR = "#494949";
const DEAD_COLOR = "#494949";
const ALIVE_COLOR = "#fdf8d8";

const drawGrid = (
  canvasContext: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  canvasContext.beginPath();
  canvasContext.strokeStyle = GRID_COLOR;

  // Vertical lines.
  for (let i = 0; i <= width; i++) {
    canvasContext.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    canvasContext.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
  }

  // Horizontal lines.
  for (let j = 0; j <= height; j++) {
    canvasContext.moveTo(0, j * (CELL_SIZE + 1) + 1);
    canvasContext.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
  }

  canvasContext.stroke();
};

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

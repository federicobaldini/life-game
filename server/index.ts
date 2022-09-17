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

const getIndex = (row: number, column: number, width: number) => {
  return row * width + column;
};

const drawCells = (
  universe: Universe,
  canvasContext: CanvasRenderingContext2D,
  wasmMemory: WebAssembly.Memory,
  width: number,
  height: number
) => {
  const cellsPtr = universe.cells();
  const cells = new Uint8Array(wasmMemory.buffer, cellsPtr, width * height);

  canvasContext.beginPath();

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col, width);

      canvasContext.fillStyle =
        cells[idx] === Cell.Dead ? DEAD_COLOR : ALIVE_COLOR;

      canvasContext.fillRect(
        /*
        With grid:
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        */
        col * CELL_SIZE,
        row * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  canvasContext.stroke();
};

init().then((wasm: InitOutput) => {
  // Construct the universe, and get its width and height.
  const universe: Universe = Universe.new(100, 100);
  const width: number = universe.width();
  const height: number = universe.height();

  const lifeCanvasElement: HTMLCanvasElement | null = document.getElementById(
    "life-game-canvas"
  ) as HTMLCanvasElement | null;

  if (lifeCanvasElement) {
    /*
    With grid:
    lifeCanvasElement.height = (CELL_SIZE + 1) * height + 1;
    lifeCanvasElement.width = (CELL_SIZE + 1) * width + 1;
    */

    lifeCanvasElement.height = CELL_SIZE * height;
    lifeCanvasElement.width = CELL_SIZE * width;

    const lifeCanvasContext: CanvasRenderingContext2D =
      lifeCanvasElement.getContext("2d");

    const renderLoop = () => {
      const frame_per_second: number = 18;
      setTimeout(() => {
        universe.update();

        // drawGrid(lifeCanvasContext, width, height);
        drawCells(universe, lifeCanvasContext, wasm.memory, width, height);

        requestAnimationFrame(renderLoop);
      }, 1000 / frame_per_second);
    };

    requestAnimationFrame(renderLoop);
  }
});

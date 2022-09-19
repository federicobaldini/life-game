import init, { InitOutput, Universe, Cell } from "life-game";
import { enableControlButton } from "./utils/control-button";
import { enableResetButton } from "./utils/reset-button";
import { enableMouseNavigation } from "./utils/mouse-navigation";
import { enableZoom } from "./utils/zoom-control";

let CELL_SIZE = 10; // px
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
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  canvasContext.stroke();
};

init().then((wasm: InitOutput) => {
  const lifeApplicationContainerElement: HTMLElement | null =
    document.getElementById("life-game__canvas-container");
  const lifeCanvasElement: HTMLCanvasElement | null = document.getElementById(
    "life-game__canvas"
  ) as HTMLCanvasElement | null;
  const lifePopulationElement: HTMLElement | null = document.getElementById(
    "life-game__population-data"
  );
  const lifeGenerationElement: HTMLElement | null = document.getElementById(
    "life-game__generation-data"
  );
  const lifeControlButton: HTMLButtonElement | null = document.getElementById(
    "life-game__play-button"
  ) as HTMLButtonElement | null;
  const lifeResetButton: HTMLButtonElement | null = document.getElementById(
    "life-game__reset-button"
  ) as HTMLButtonElement | null;

  // Construct the universe, and get its width and height.
  const universe: Universe = Universe.new(310, 310);
  const universeWidth: number = universe.width();
  const universeHeight: number = universe.height();
  const playLife: { play: boolean } = { play: false };
  let zoom: number = CELL_SIZE - 1;

  if (lifeCanvasElement) {
    const lifeCanvasContext: CanvasRenderingContext2D =
      lifeCanvasElement.getContext("2d");

    lifeCanvasElement.height = (CELL_SIZE + 1) * universeHeight + 1;
    lifeCanvasElement.width = (CELL_SIZE + 1) * 310 + 1;

    if (lifeApplicationContainerElement) {
      enableMouseNavigation(lifeApplicationContainerElement);
    }

    enableZoom(
      () => {
        if (zoom + 1 <= 20) {
          CELL_SIZE += 1;
          zoom += 1;
        }
      },
      () => {
        if (zoom - 1 >= 0) {
          CELL_SIZE -= 1;
          zoom -= 1;
        }
      },
      () => {
        lifeCanvasElement.height = (CELL_SIZE + 1) * universeHeight + 1;
        lifeCanvasElement.width = (CELL_SIZE + 1) * universeWidth + 1;
        // drawGrid(lifeCanvasContext, universeWidth, universeHeight);
        drawCells(
          universe,
          lifeCanvasContext,
          wasm.memory,
          universeWidth,
          universeHeight
        );
      }
    );

    const renderLoop = () => {
      const frame_per_second: number = 10;
      setTimeout(() => {
        lifePopulationElement.innerHTML = String(universe.population());
        lifeGenerationElement.innerHTML = String(universe.generation());

        universe.update();

        // drawGrid(lifeCanvasContext, universeWidth, universeHeight);
        drawCells(
          universe,
          lifeCanvasContext,
          wasm.memory,
          universeWidth,
          universeHeight
        );

        if (playLife.play) {
          requestAnimationFrame(renderLoop);
        }
      }, 1000 / frame_per_second);
    };

    requestAnimationFrame(renderLoop);

    if (lifeControlButton) {
      enableControlButton(lifeControlButton, playLife, renderLoop);
    }

    if (lifeResetButton) {
      enableResetButton(lifeResetButton, () => {
        universe.reset();
        // drawGrid(lifeCanvasContext, universeWidth, universeHeight);
        drawCells(
          universe,
          lifeCanvasContext,
          wasm.memory,
          universeWidth,
          universeHeight
        );
      });
    }
  }
});

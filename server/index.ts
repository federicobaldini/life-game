import init, { InitOutput, Universe, Cell } from "life-game";
import { enableControlButton } from "./utils/control-button";
import { enableMouseNavigation } from "./utils/mouse-navigation";

let CELL_SIZE = 5; // px
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
        */
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        /*
          Without grid:
          col * CELL_SIZE,
          row * CELL_SIZE,
        */
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
  const playLife: { play: boolean } = { play: false };
  let startPopulation: number = 0;
  let maxPopulation: number = 0;
  let score: number = 0;

  const lifeApplicationContainerElement: HTMLElement | null =
    document.getElementById("life-game__canvas-container");
  const lifeCanvasElement: HTMLCanvasElement | null = document.getElementById(
    "life-game__canvas"
  ) as HTMLCanvasElement | null;
  const lifeStartPopulationElement: HTMLElement | null =
    document.getElementById("life-game__start-population-data");
  const lifePopulationElement: HTMLElement | null = document.getElementById(
    "life-game__population-data"
  );
  const lifeGenerationElement: HTMLElement | null = document.getElementById(
    "life-game__generation-data"
  );
  const lifePeakPopulationElement: HTMLElement | null = document.getElementById(
    "life-game__peak-population-data"
  );
  const lifeScoreElement: HTMLElement | null = document.getElementById(
    "life-game__score-data"
  );
  const lifeControlButton: HTMLButtonElement | null = document.getElementById(
    "life-game__play-button"
  ) as HTMLButtonElement | null;

  /*
    With grid:
  */
  lifeCanvasElement.height = (CELL_SIZE + 1) * height + 1;
  lifeCanvasElement.width = (CELL_SIZE + 1) * width + 1;
  /*
    Without grid:
    lifeCanvasElement.height = CELL_SIZE * height;
    lifeCanvasElement.width = CELL_SIZE * width;
  */

  if (lifeApplicationContainerElement) {
    enableMouseNavigation(lifeApplicationContainerElement);
  }

  if (lifeCanvasElement) {
    const lifeCanvasContext: CanvasRenderingContext2D =
      lifeCanvasElement.getContext("2d");

    addEventListener("keypress", (event: KeyboardEvent) => {
      if (event.code === "BracketRight" || event.code === "Slash") {
        switch (event.code) {
          case "BracketRight":
            CELL_SIZE += 1;
            break;
          case "Slash":
            CELL_SIZE -= 1;
            break;
        }
        lifeCanvasElement.height = (CELL_SIZE + 1) * height + 1;
        lifeCanvasElement.width = (CELL_SIZE + 1) * width + 1;
      }
    });

    const renderLoop = () => {
      const frame_per_second: number = 10;
      setTimeout(() => {
        lifePopulationElement.innerHTML = String(universe.population());
        lifeGenerationElement.innerHTML = String(universe.generation());

        if (universe.generation() === 0) {
          startPopulation = universe.population();
          lifeStartPopulationElement.innerHTML = String(startPopulation);
        }
        if (universe.population() > maxPopulation) {
          maxPopulation = universe.population();
          lifePeakPopulationElement.innerHTML = String(maxPopulation);
          lifeScoreElement.innerHTML = String(
            (maxPopulation - startPopulation) * -1
          );
        }

        universe.update();

        drawGrid(lifeCanvasContext, width, height);
        drawCells(universe, lifeCanvasContext, wasm.memory, width, height);

        if (playLife.play) {
          requestAnimationFrame(renderLoop);
        }
      }, 1000 / frame_per_second);
    };

    requestAnimationFrame(renderLoop);

    if (lifeControlButton) {
      enableControlButton(lifeControlButton, playLife, renderLoop);
    }
  }
});

import init, { InitOutput, Universe, Cell } from "life-game";
import { enableControlButton } from "./utils/control-button";
import { enableResetButton } from "./utils/reset-button";
import { enableMouseNavigation } from "./utils/mouse-navigation";
import { enableZoom } from "./utils/zoom-control";

let CELL_SIZE = 30; // px
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
  const gameStatus: { play: boolean } = { play: false };
  let zoom: number = CELL_SIZE - 1;
  let animationId: number | null = null;
  let mooving: boolean = false;
  let initialCursorPositionX: number = 0;
  let initialCursorPositionY: number = 0;

  const setMooving = (event: MouseEvent): void => {
    if (
      Math.abs(event.clientX - initialCursorPositionX) > 20 ||
      Math.abs(event.clientY - initialCursorPositionY) > 20
    ) {
      mooving = true;
    }
  };

  if (lifeCanvasElement) {
    const lifeCanvasContext: CanvasRenderingContext2D =
      lifeCanvasElement.getContext("2d");

    lifeCanvasElement.height = (CELL_SIZE + 1) * universeHeight + 1;
    lifeCanvasElement.width = (CELL_SIZE + 1) * 310 + 1;

    lifeCanvasElement.addEventListener("mousedown", (event: MouseEvent) => {
      initialCursorPositionX = event.clientX;
      initialCursorPositionY = event.clientY;
      lifeCanvasElement.addEventListener("mousemove", setMooving);
    });

    lifeCanvasElement.addEventListener("mouseup", (event: MouseEvent) => {
      if (!mooving) {
        const boundingRect = lifeCanvasElement.getBoundingClientRect();

        const scaleX = lifeCanvasElement.width / boundingRect.width;
        const scaleY = lifeCanvasElement.height / boundingRect.height;

        const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
        const canvasTop = (event.clientY - boundingRect.top) * scaleY;

        const row = Math.min(
          Math.floor(canvasTop / (CELL_SIZE + 1)),
          universeHeight - 1
        );
        const col = Math.min(
          Math.floor(canvasLeft / (CELL_SIZE + 1)),
          universeWidth - 1
        );

        universe.toggle_cell(row, col);

        // drawGrid(lifeCanvasContext, universeWidth, universeHeight);
        drawCells(
          universe,
          lifeCanvasContext,
          wasm.memory,
          universeWidth,
          universeHeight
        );
      }
      mooving = false;
      lifeCanvasElement.removeEventListener("mousemove", setMooving);
    });

    if (lifeApplicationContainerElement) {
      enableMouseNavigation(lifeApplicationContainerElement);
    }

    enableZoom(
      () => {
        if (zoom + 1 <= 30) {
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
      const frame_per_second: number = 30;
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

        if (gameStatus.play) {
          animationId = requestAnimationFrame(renderLoop);
        }
      }, 1000 / frame_per_second);
    };

    requestAnimationFrame(renderLoop);

    if (lifeControlButton) {
      enableControlButton(
        lifeControlButton,
        gameStatus,
        animationId,
        renderLoop
      );
    }

    if (lifeResetButton) {
      enableResetButton(lifeResetButton, () => {
        universe.reset();
        lifePopulationElement.innerHTML = String(universe.population());
        lifeGenerationElement.innerHTML = String(universe.generation());
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

import init, { InitOutput, Universe, Cell } from "life-game";
import { enableControlButton } from "./utils/control-button";
import { enableResetButton } from "./utils/reset-button";
import { enableMouseNavigation } from "./utils/mouse-navigation";
import { enableZoom } from "./utils/zoom-control";
import { parseRule, getDensityForRule } from "./utils/rules";

let cell_size = 1; // px
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
    canvasContext.moveTo(i * (cell_size + 1) + 1, 0);
    canvasContext.lineTo(i * (cell_size + 1) + 1, (cell_size + 1) * height + 1);
  }

  // Horizontal lines.
  for (let j = 0; j <= height; j++) {
    canvasContext.moveTo(0, j * (cell_size + 1) + 1);
    canvasContext.lineTo((cell_size + 1) * width + 1, j * (cell_size + 1) + 1);
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
        col * (cell_size + 1) + 1,
        row * (cell_size + 1) + 1,
        cell_size,
        cell_size
      );
    }
  }

  canvasContext.stroke();
};

init().then((wasm: InitOutput) => {
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
  const lifeRandomButton: HTMLButtonElement | null = document.getElementById(
    "life-game__random-button"
  ) as HTMLButtonElement | null;
  const ruleSelectorForm: HTMLFormElement | null = document.getElementById(
    "life-game__rules-form"
  ) as HTMLFormElement | null;
  const checkedInput: HTMLInputElement =
    document.querySelector<HTMLInputElement>('input[name="rule"]:checked');

  // Construct the universe, and get its width and height.
  const universe: Universe = Universe.new(310, 310);
  const universeWidth: number = universe.width();
  const universeHeight: number = universe.height();
  const gameStatus: { play: boolean } = { play: false };
  let zoom: number = cell_size - 1;
  let animationId: number | null = null;
  let mooving: boolean = false;
  let initialCursorPositionX: number = 0;
  let initialCursorPositionY: number = 0;
  let initialCanvasPositionX: number = 0;
  let initialCanvasPositionY: number = 0;
  let latestCanvasPositionX: number = lifeCanvasElement.offsetTop;
  let latestCanvasPositionY: number = lifeCanvasElement.offsetLeft;
  let noNewPopulationCounter: number = 0;
  let prevPopulation: number = 0;
  let peakPopulation: number = 0;
  let peakGeneration: number = 0;
  let incrementZoomX: number = 0;
  let incrementZoomY: number = 0;

  if (checkedInput) {
    const [b, s] = parseRule(checkedInput.value);
    universe.set_rule(b, s);
    const density: number = getDensityForRule(checkedInput.value);
    universe.random(density);
  } else {
    // fallback default
    universe.set_rule(new Uint8Array([3]), new Uint8Array([2, 3])); // Conway
    universe.random(20);
  }

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

    lifeCanvasElement.height = (cell_size + 1) * universeHeight + 1;
    lifeCanvasElement.width = (cell_size + 1) * 310 + 1;

    lifePopulationElement.textContent = String(universe.population());
    lifeGenerationElement.textContent = String(universe.generation());
    peakPopulation = universe.population();

    // drawGrid(lifeCanvasContext, universeWidth, universeHeight);
    drawCells(
      universe,
      lifeCanvasContext,
      wasm.memory,
      universeWidth,
      universeHeight
    );

    document.addEventListener("mousedown", (event: MouseEvent) => {
      initialCursorPositionX = event.clientX;
      initialCursorPositionY = event.clientY;
      document.addEventListener("mousemove", setMooving);
    });

    document.addEventListener("mouseup", (event: MouseEvent) => {
      if (!mooving) {
        const boundingRect = lifeCanvasElement.getBoundingClientRect();

        const scaleX = lifeCanvasElement.width / boundingRect.width;
        const scaleY = lifeCanvasElement.height / boundingRect.height;

        const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
        const canvasTop = (event.clientY - boundingRect.top) * scaleY;

        const row = Math.min(
          Math.floor(canvasTop / (cell_size + 1)),
          universeHeight - 1
        );
        const col = Math.min(
          Math.floor(canvasLeft / (cell_size + 1)),
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
      document.removeEventListener("mousemove", setMooving);
    });

    const renderLoop = (): void => {
      const frame_per_second: number = 30;
      setTimeout((): void => {
        lifePopulationElement.textContent = String(universe.population());
        lifeGenerationElement.textContent = String(universe.generation());
        prevPopulation = universe.population();

        universe.update();

        if (prevPopulation === universe.population()) {
          noNewPopulationCounter += 1;
        } else {
          noNewPopulationCounter = 0;
        }

        if (universe.population() > peakPopulation) {
          peakPopulation = universe.population();
          peakGeneration = universe.generation();
        }

        // drawGrid(lifeCanvasContext, universeWidth, universeHeight);
        drawCells(
          universe,
          lifeCanvasContext,
          wasm.memory,
          universeWidth,
          universeHeight
        );

        if (gameStatus.play && noNewPopulationCounter < 10) {
          animationId = requestAnimationFrame(renderLoop);
        } else if (noNewPopulationCounter >= 10) {
          gameStatus.play = false;
          lifeControlButton.textContent = "PLAY";
          noNewPopulationCounter = 0;
          prevPopulation = 0;
          console.log("Peak population:", peakPopulation);
          console.log("Peak generation:", peakGeneration);
          peakPopulation = 0;
          peakGeneration = 0;
        }
      }, 1000 / frame_per_second);
    };

    enableZoom(
      (): void => {
        if (zoom + 1 <= 30) {
          cell_size += 1;
          zoom += 1;
          latestCanvasPositionX = lifeCanvasElement.offsetLeft;
          latestCanvasPositionY = lifeCanvasElement.offsetTop;

          incrementZoomX = (universeWidth - initialCanvasPositionX) / 2;
          incrementZoomY = (universeHeight - initialCanvasPositionY) / 2;

          latestCanvasPositionX = latestCanvasPositionX - incrementZoomX;
          latestCanvasPositionY = latestCanvasPositionY - incrementZoomY;

          lifeCanvasElement.style.top = `${latestCanvasPositionY}px`;
          lifeCanvasElement.style.left = `${latestCanvasPositionX}px`;
        }
      },
      (): void => {
        if (zoom - 1 >= 0) {
          cell_size -= 1;
          zoom -= 1;
          latestCanvasPositionX = lifeCanvasElement.offsetLeft;
          latestCanvasPositionY = lifeCanvasElement.offsetTop;

          incrementZoomX = (universeWidth - initialCanvasPositionX) / 2;
          incrementZoomY = (universeHeight - initialCanvasPositionY) / 2;

          latestCanvasPositionX = latestCanvasPositionX + incrementZoomX;
          latestCanvasPositionY = latestCanvasPositionY + incrementZoomY;

          lifeCanvasElement.style.top = `${latestCanvasPositionY}px`;
          lifeCanvasElement.style.left = `${latestCanvasPositionX}px`;
        }
      },
      (): void => {
        lifeCanvasElement.height = (cell_size + 1) * universeHeight + 1;
        lifeCanvasElement.width = (cell_size + 1) * universeWidth + 1;
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

    /*
    It has to be improved, if you zoom in and then move the canvas, zoom in and zoom out don't work
    if (lifeCanvasElement) {
      enableMouseNavigation(lifeCanvasElement, (): void => {
        lifeCanvasElement.style.top = "0px";
        lifeCanvasElement.style.left = "0px";
        initialCanvasPositionX = 0;
        initialCanvasPositionY = 0;
        zoom = 0;
        cell_size = 1;
        lifeCanvasContext.clearRect(
          0,
          0,
          lifeCanvasElement.width,
          lifeCanvasElement.height
        );
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
    */

    if (lifeControlButton) {
      enableControlButton(
        lifeControlButton,
        gameStatus,
        animationId,
        renderLoop
      );
    }

    if (lifeResetButton) {
      enableResetButton(lifeResetButton, (): void => {
        universe.reset();

        // Read the currently selected rule
        const selectedInput: HTMLInputElement =
          document.querySelector<HTMLInputElement>(
            'input[name="rule"]:checked'
          );

        const selectedRule: string = selectedInput?.value ?? "B3/S23";
        const density: number = getDensityForRule(selectedRule);
        universe.random(density);

        lifePopulationElement.textContent = String(universe.population());
        lifeGenerationElement.textContent = String(universe.generation());
        peakPopulation = universe.population();
        peakGeneration = universe.generation();

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

    lifeRandomButton.addEventListener("click", (): void => {
      cancelAnimationFrame(animationId);
      gameStatus.play = false;
      lifeControlButton.textContent = "PLAY";

      const selectedInput: HTMLInputElement =
        document.querySelector<HTMLInputElement>('input[name="rule"]:checked');

      const selectedRule: string = selectedInput?.value ?? "B3/S23";
      const density: number = getDensityForRule(selectedRule);

      universe.reset();
      universe.random(density);

      lifePopulationElement.textContent = String(universe.population());
      lifeGenerationElement.textContent = String(universe.generation());
      peakPopulation = universe.population();
      peakGeneration = universe.generation();

      // drawGrid(lifeCanvasContext, universeWidth, universeHeight);
      drawCells(
        universe,
        lifeCanvasContext,
        wasm.memory,
        universeWidth,
        universeHeight
      );
    });

    if (ruleSelectorForm) {
      ruleSelectorForm.addEventListener("change", (event) => {
        const target: HTMLInputElement = event.target as HTMLInputElement;

        if (target && target.name === "rule") {
          const ruleString: string = target.value;
          const [birth, survival] = parseRule(ruleString);
          const density: number = getDensityForRule(ruleString);

          universe.set_rule(birth, survival);
          universe.reset();
          universe.random(density);

          lifePopulationElement.textContent = String(universe.population());
          lifeGenerationElement.textContent = String(universe.generation());

          drawCells(
            universe,
            lifeCanvasContext,
            wasm.memory,
            universeWidth,
            universeHeight
          );
        }
      });
    }
  }
});

<script setup lang="ts">
import { ref, onMounted, defineProps, watch } from 'vue';
import { parseRule, getDensityForRule, LifeRule } from '../../utils/rules';
import init, { Universe, Cell, type InitOutput } from 'life-game';
import { interpolateColorHex } from '@/shared/utils/color';

// Props personalizzabili
const props = withDefaults(
  defineProps<{
    width?: number;
    height?: number;
    rule?: LifeRule;
    play?: boolean;
    cellSize?: number;
    speed?: number;
    age?: { youngColorHex: string; oldColorHex: string; maxAge: number };
  }>(),
  {
    width: 310,
    height: 310,
    rule: LifeRule.CONWAY,
    play: false,
    cellSize: 1,
    speed: 30,
  },
);

const canvas = ref<HTMLCanvasElement | null>(null);
let wasm: InitOutput;
let universe: Universe;
let animationId: number;
let canvasContext: CanvasRenderingContext2D | null = null;

const DEAD_COLOR = '#ffffff';
const ALIVE_COLOR = '#263294';
const GRID_COLOR = '#ffffff';

// Disegna griglia
const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number): void => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  for (let i = 0; i <= width; i++) {
    ctx.moveTo(i * (props.cellSize + 1) + 1, 0);
    ctx.lineTo(i * (props.cellSize + 1) + 1, (props.cellSize + 1) * height + 1);
  }
  for (let j = 0; j <= height; j++) {
    ctx.moveTo(0, j * (props.cellSize + 1) + 1);
    ctx.lineTo((props.cellSize + 1) * width + 1, j * (props.cellSize + 1) + 1);
  }
  ctx.stroke();
};

// Coordinate lineari
const getIndex = (row: number, col: number, width: number): number => {
  return row * width + col;
};

// Disegna celle
const drawCells = (ctx: CanvasRenderingContext2D, width: number, height: number): void => {
  const cellsPtr: number = universe.cells();
  const cells: Uint8Array<ArrayBuffer> = new Uint8Array(
    wasm.memory.buffer,
    cellsPtr,
    width * height,
  );
  const agePtr: number = universe.cell_age();
  const ages: Uint8Array<ArrayBuffer> = new Uint8Array(wasm.memory.buffer, agePtr, width * height);

  ctx.beginPath();
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx: number = getIndex(row, col, width);

      if (cells[idx] === Cell.Dead) {
        ctx.fillStyle = DEAD_COLOR;
      } else if (!props.age) {
        ctx.fillStyle = ALIVE_COLOR;
      } else {
        const age: number = ages[idx];
        const time: number = Math.min(age / props.age.maxAge, 1);

        ctx.fillStyle = interpolateColorHex(props.age.youngColorHex, props.age.oldColorHex, time);
      }

      ctx.fillRect(
        col * (props.cellSize + 1) + 1,
        row * (props.cellSize + 1) + 1,
        props.cellSize,
        props.cellSize,
      );
    }
  }
  ctx.stroke();
};

const render = (ctx: CanvasRenderingContext2D, width: number, height: number): void => {
  const renderFrame = () => {
    universe.update();
    drawCells(ctx, width, height);

    animationId = window.setTimeout(() => {
      requestAnimationFrame(renderFrame);
    }, 1000 / props.speed);
  };

  renderFrame();
};

const selectCellHandler = (event: MouseEvent): void => {
  if (canvas.value && canvasContext) {
    const rect: DOMRect = canvas.value.getBoundingClientRect();
    const scaleX: number = canvas.value.width / rect.width;
    const scaleY: number = canvas.value.height / rect.height;

    const canvasX: number = (event.clientX - rect.left) * scaleX;
    const canvasY: number = (event.clientY - rect.top) * scaleY;

    const column: number = Math.min(Math.floor(canvasX / (props.cellSize + 1)), props.width - 1);
    const row: number = Math.min(Math.floor(canvasY / (props.cellSize + 1)), props.height - 1);

    universe.toggle_cell(row, column);
    drawCells(canvasContext, props.width, props.height);
  }
};

watch(
  (): boolean => props.play,
  (playing) => {
    if (playing) {
      if (canvasContext) {
        render(canvasContext, props.width, props.height);
      }
    } else {
      if (animationId) {
        clearTimeout(animationId);
      }
    }
  },
);

watch(
  (): number => props.cellSize,
  (newCellSize) => {
    if (canvas.value && canvasContext) {
      // 1. ridimensiona la tela in base al nuovo cellSize
      canvas.value.width = (newCellSize + 1) * props.width + 1;
      canvas.value.height = (newCellSize + 1) * props.height + 1;

      // 2. pulisci la tela
      canvasContext.clearRect(0, 0, canvas.value.width, canvas.value.height);

      // 3. ridisegna griglia e celle usando sempre 310×310
      drawGrid(canvasContext, props.width, props.height);
      drawCells(canvasContext, props.width, props.height);
    }
  },
);

watch(
  (): LifeRule => props.rule,
  (newRule) => {
    if (universe && canvasContext) {
      const [birth, survival] = parseRule(newRule);

      universe.set_rule(birth, survival);
      universe.reset();
      universe.random(getDensityForRule(newRule));

      drawCells(canvasContext, props.width, props.height);
    }
  },
);

watch(
  (): number => props.speed,
  () => {
    if (props.play && canvasContext) {
      clearTimeout(animationId);
      render(canvasContext, props.width, props.height);
    }
  },
);

onMounted(async (): Promise<void> => {
  wasm = await init();
  universe = Universe.new(props.width, props.height);

  // Imposta regola (es. "B3/S23")
  if (props.rule) {
    const [birth, survival] = parseRule(props.rule);
    universe.set_rule(birth, survival);
    universe.random(getDensityForRule(props.rule));
  } else {
    universe.set_rule(new Uint8Array([3]), new Uint8Array([2, 3]));
    universe.random(20);
  }

  if (canvas.value) {
    canvasContext = canvas.value.getContext('2d')!;
    canvas.value.width = (props.cellSize + 1) * props.width + 1;
    canvas.value.height = (props.cellSize + 1) * props.height + 1;

    drawGrid(canvasContext, props.width, props.height);
    drawCells(canvasContext, props.width, props.height);

    if (props.play) {
      render(canvasContext, props.width, props.height);
    }
  }
});
</script>

<template>
  <canvas ref="canvas" class="grid-item__canvas" @click="selectCellHandler" />
</template>

<style scoped>
.grid-item__canvas {
  display: block;
  border: 1px solid #e5e7e9;
  background-color: #ffffff;
}
</style>

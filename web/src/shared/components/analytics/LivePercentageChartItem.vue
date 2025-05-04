<script setup lang="ts">
import { ref, watch, onMounted, type Ref } from 'vue';
import { Chart } from 'chart.js';

const props = defineProps<{
  data: Array<{ generation: number; population: number }>;
  totalCells: number;
}>();

const chartCanvas: Ref<HTMLCanvasElement | null> = ref(null);
let chart: Chart | null = null;

const renderChart = (): void => {
  const generations: Array<number> = props.data.map((data) => data.generation);
  const percentages: Array<number> = props.data.map((data) =>
    parseFloat(((data.population / props.totalCells) * 100).toFixed(2)),
  );

  if (!chart && chartCanvas.value) {
    chart = new Chart(chartCanvas.value, {
      type: 'line',
      data: {
        labels: generations,
        datasets: [
          {
            label: 'Live Cell Percentage',
            data: percentages,
            borderWidth: 2,
            borderColor: '#2196F3',
            backgroundColor: 'rgba(33, 150, 243, 0.2)',
            fill: true,
            tension: 0.25,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: { title: { display: true, text: 'Generation' } },
          y: {
            title: { display: true, text: '% Live Cells' },
            beginAtZero: true,
            max: 100,
          },
        },
      },
    });
  } else if (chart) {
    chart.data.labels = generations;
    chart.data.datasets[0].data = percentages;
    chart.update();
  }
};

watch(
  (): Array<{ generation: number; population: number }> => props.data,
  () => {
    renderChart();
  },
  { deep: true },
);

onMounted((): void => {
  renderChart();
});
</script>

<template>
  <div class="live-percentage-chart-item">
    <canvas ref="chartCanvas" class="live-percentage-chart-item__canvas"></canvas>
  </div>
</template>

<style scoped></style>

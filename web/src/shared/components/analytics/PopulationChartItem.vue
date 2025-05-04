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
  const populations: Array<number> = props.data.map((data) => data.population);
  const deaths: Array<number> = populations.map((population) => props.totalCells - population);

  if (!chart && chartCanvas.value) {
    chart = new Chart(chartCanvas.value, {
      type: 'line',
      data: {
        labels: generations,
        datasets: [
          {
            label: 'Live Cells',
            data: populations,
            borderWidth: 2,
            borderColor: '#4CAF50',
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            fill: true,
            tension: 0.25,
            pointRadius: 0,
          },
          {
            label: 'Dead Cells',
            data: deaths,
            borderWidth: 2,
            borderColor: '#FF5252',
            backgroundColor: 'rgba(255, 82, 82, 0.1)',
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
          y: { title: { display: true, text: 'Population' }, beginAtZero: true },
        },
      },
    });
  } else if (chart) {
    chart.data.labels = generations;
    chart.data.datasets[0].data = populations;
    chart.data.datasets[1].data = deaths;
    chart.update();
  }
};

// Rendi il grafico reattivo ai cambiamenti dei dati
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
  <div class="population-chart-item">
    <canvas ref="chartCanvas" class="population-chart-item__canvas"></canvas>
  </div>
</template>

<style scoped></style>

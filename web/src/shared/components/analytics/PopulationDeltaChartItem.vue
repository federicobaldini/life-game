<script setup lang="ts">
import { ref, watch, onMounted, type Ref } from 'vue';
import { Chart } from 'chart.js';

const props = defineProps<{
  data: Array<{ generation: number; population: number }>;
}>();

const chartCanvas: Ref<HTMLCanvasElement | null> = ref(null);
let chart: Chart | null = null;

const renderChart = (): void => {
  const generations: Array<number> = props.data.map((data) => data.generation);
  const deltas: Array<number> = props.data.map((data, index, array) => {
    if (index === 0) return 0;
    return data.population - array[index - 1].population;
  });

  if (!chart && chartCanvas.value) {
    chart = new Chart(chartCanvas.value, {
      type: 'line',
      data: {
        labels: generations,
        datasets: [
          {
            label: 'Δ Population',
            data: deltas,
            borderWidth: 2,
            borderColor: '#FFC107',
            backgroundColor: 'rgba(255, 193, 7, 0.2)',
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
            title: { display: true, text: 'Population Change' },
            beginAtZero: false,
          },
        },
      },
    });
  } else if (chart) {
    chart.data.labels = generations;
    chart.data.datasets[0].data = deltas;
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
  <div class="population-delta-chart-item">
    <canvas ref="chartCanvas" class="population-delta-chart-item__canvas"></canvas>
  </div>
</template>

<style scoped></style>

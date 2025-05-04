<script setup lang="ts">
import AgeItem from './AgeItem.vue';
import LivePercentageChartItem from './LivePercentageChartItem.vue';
import PopulationChartItem from './PopulationChartItem.vue';
import PopulationDeltaChartItem from './PopulationDeltaChartItem.vue';

const props = defineProps<{
  active: boolean;
  populationData: Array<{ generation: number; population: number }>;
  selectedAgeSettings?: { youngColorHex: string; oldColorHex: string; maxAge: number };
}>();

const emit = defineEmits<{
  (
    event: 'set-age-settings',
    ageSettings: { youngColorHex: string; oldColorHex: string; maxAge: number } | undefined,
  ): void;
}>();
</script>

<template>
  <div :class="['analytics-item', { active: props.active }]">
    <div class="analytics-item__limiter">
      <PopulationChartItem :data="props.populationData" :total-cells="310 * 310" />
      <LivePercentageChartItem :data="props.populationData" :total-cells="310 * 310" />
      <PopulationDeltaChartItem :data="props.populationData" />
      <AgeItem
        :selected-age-settings="props.selectedAgeSettings"
        @set-age-settings="(ageSettings) => emit('set-age-settings', ageSettings)"
      />
    </div>
  </div>
</template>

<style scoped>
.analytics-item {
  position: absolute;
  right: 0px;
  width: 0px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 16px;
  border-left: 1px solid #e5e7e9;
  background-color: #ffffff;
  transition: 0.2s linear;
  overflow-x: hidden;
  overflow-y: auto;
}
.analytics-item.active {
  width: 320px;
}
.analytics-item__limiter {
  min-width: 320px;
  padding: 16px;
}
</style>

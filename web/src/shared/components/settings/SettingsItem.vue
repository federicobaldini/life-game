<script setup lang="ts">
import { LifeRule } from '@/shared/utils/rules';
import RulesList from './RulesList.vue';
import SpeedSliderItem from './SpeedSliderItem.vue';
import AgeItem from './AgeItem.vue';

const props = defineProps<{
  active: boolean;
  selectedRule: LifeRule;
  selectedSpeed: number;
  selectedAgeData?: { youngColorHex: string; oldColorHex: string; maxAge: number };
}>();

const emit = defineEmits<{
  (event: 'set-rule', rule: LifeRule): void;
  (event: 'set-speed', speed: number): void;
  (
    event: 'set-age-data',
    ageData: { youngColorHex: string; oldColorHex: string; maxAge: number } | undefined,
  ): void;
}>();
</script>

<template>
  <div :class="['settings-item', { active: props.active }]">
    <div class="settings-item__limiter">
      <RulesList :selected-rule="props.selectedRule" @set-rule="(rule) => emit('set-rule', rule)" />
      <SpeedSliderItem
        :selected-speed="props.selectedSpeed"
        @set-speed="(speed) => emit('set-speed', speed)"
      />
      <AgeItem
        :selected-age-data="props.selectedAgeData"
        @set-age-data="(ageData) => emit('set-age-data', ageData)"
      />
    </div>
  </div>
</template>

<style scoped>
.settings-item {
  position: absolute;
  left: 0px;
  width: 0px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  gap: 16px;
  border-right: 1px solid #e5e7e9;
  background-color: #ffffff;
  transition: 0.2s linear;
  overflow-x: hidden;
  overflow-y: auto;
}
.settings-item.active {
  width: 320px;
}
.settings-item__limiter {
  min-width: 320px;
  padding: 16px;
}
</style>

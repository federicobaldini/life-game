<script setup lang="ts">
import { type Ref, ref } from 'vue';
import { LifeRule } from '@/shared/utils/rules';
import GridItem from '@/shared/components/grid/GridItem.vue';
import MenuItem from '@/shared/components/menu/MenuItem.vue';
import SettingsItem from '@/shared/components/settings/SettingsItem.vue';
import AnalyticsItem from '@/shared/components/analytics/AnalyticsItem.vue';

const isPlaying: Ref<boolean> = ref(false);
const isSettingsActive: Ref<boolean> = ref(true);
const selectedRule: Ref<LifeRule> = ref(LifeRule.CONWAY);
const selectedSpeed: Ref<number> = ref(60); // frame by second
const selectedAgeData: Ref<
  { youngColorHex: string; oldColorHex: string; maxAge: number } | undefined
> = ref(undefined);

const togglePlayHandler = (): void => {
  isPlaying.value = !isPlaying.value;
};

const toggleSettingsHandler = (): void => {
  isSettingsActive.value = !isSettingsActive.value;
};

const setRuleHandler = (rule: LifeRule): void => {
  selectedRule.value = rule;
};

const setSpeedHandler = (speed: number): void => {
  selectedSpeed.value = speed;
};

const setAgeDataHandler = (
  ageData:
    | {
        youngColorHex: string;
        oldColorHex: string;
        maxAge: number;
      }
    | undefined,
): void => {
  selectedAgeData.value = ageData;
};
</script>

<template>
  <div class="home-view">
    <SettingsItem
      :active="isSettingsActive"
      :selected-rule="selectedRule"
      :selected-speed="selectedSpeed"
      :selected-age-data="selectedAgeData"
      @set-rule="setRuleHandler"
      @set-speed="setSpeedHandler"
      @set-age-data="setAgeDataHandler"
    />
    <AnalyticsItem :active="isSettingsActive" />
    <GridItem
      :play="isPlaying"
      :rule="selectedRule"
      :speed="selectedSpeed"
      :age="selectedAgeData"
    />
    <div class="home-view__actions-container">
      <MenuItem
        :is-playing="isPlaying"
        @settings="toggleSettingsHandler"
        @toggle-play="togglePlayHandler"
      ></MenuItem>
    </div>
  </div>
</template>

<style scoped>
.home-view {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
}
.home-view__actions-container {
  position: fixed;
  bottom: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}
</style>

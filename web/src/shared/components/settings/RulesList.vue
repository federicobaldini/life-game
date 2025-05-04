<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { LifeRule } from '@/shared/utils/rules';
import RulesItem from './RulesItem.vue';

const props = defineProps<{
  selectedRule: LifeRule;
}>();

const emit = defineEmits<{
  (event: 'set-rule', rule: LifeRule): void;
}>();

const rules: Array<LifeRule> = Object.values(LifeRule) as LifeRule[];
const labels: Record<LifeRule, string> = {
  [LifeRule.CONWAY]: 'Conway',
  [LifeRule.HIGH_LIFE]: 'HighLife',
  [LifeRule.SEEDS]: 'Seeds',
  [LifeRule.LIFE_WITHOUT_DEATH]: 'Life Without Death',
  [LifeRule.DAY_AND_NIGHT]: 'Day & Night',
  [LifeRule.MORLEY]: 'Morley',
  [LifeRule.DIAMOEBA]: 'Diamoeba',
  [LifeRule.ANNEAL]: 'Anneal',
  [LifeRule.MAZE]: 'Maze',
  [LifeRule.MAZECENTRIC]: 'Mazectric',
};
</script>

<template>
  <label>Rules</label>
  <ul class="rules-list">
    <li v-for="rule in rules" :key="rule" class="rules-list__item">
      <RulesItem
        :label="labels[rule]"
        :rule="rule"
        :selected-rule="props.selectedRule"
        @set-rule="(rule) => emit('set-rule', rule)"
      />
    </li>
  </ul>
</template>

<style scoped>
.rules-list {
}

.rules-list__item {
}
</style>

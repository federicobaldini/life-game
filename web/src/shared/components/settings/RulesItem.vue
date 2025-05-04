<script setup lang="ts">
import type { LifeRule } from '@/shared/utils/rules';

const props = defineProps<{
  label: string;
  rule: LifeRule;
  selectedRule: LifeRule;
}>();

const emit = defineEmits<{
  (event: 'set-rule', rule: LifeRule): void;
}>();

const onChangeRuleHandler = (rule: LifeRule) => {
  emit('set-rule', rule);
};
</script>

<template>
  <label :title="props.rule">
    <input
      type="radio"
      name="life-rule"
      :value="props.rule"
      :checked="props.selectedRule === rule"
      @change="onChangeRuleHandler(rule)"
    />
    <span class="rules-item__label">
      {{ props.label }}
    </span>
  </label>
</template>

<style scoped>
.rules-item__label {
}
</style>

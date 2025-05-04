<script setup lang="ts">
const props = defineProps<{
  active: boolean;
}>();
</script>

<template>
  <div :class="['analytics-item', { active: props.active }]">
    <div class="analytics-item__limiter"></div>
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

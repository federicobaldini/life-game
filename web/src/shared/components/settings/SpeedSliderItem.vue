<script setup lang="ts">
const props = defineProps<{
  selectedSpeed: number;
}>();

const emit = defineEmits<{
  (event: 'set-speed', speed: number): void;
}>();
</script>

<template>
  <div class="settings-item__slider-container">
    <label class="settings-item__slider-label" for="settings-item__slider">
      Speed: {{ props.selectedSpeed }} fps
    </label>
    <input
      id="settings-item__slider"
      class="settings-item__slider"
      type="range"
      min="1"
      max="60"
      value="selectedSpeed"
      @input="(event) => emit('set-speed', parseInt((event.target as HTMLInputElement).value))"
    />
  </div>
</template>

<style scoped></style>

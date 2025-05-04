<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    isPlaying?: boolean;
  }>(),
  {
    isPlaying: false,
  },
);

const emit = defineEmits<{
  (event: 'back'): void;
  (event: 'forward'): void;
  (event: 'toggle-play'): void;
  (event: 'settings'): void;
}>();

const togglePlay = () => {
  emit('toggle-play');
};

const goBack = () => {
  emit('back');
};

const goForward = () => {
  emit('forward');
};

const openSettings = () => {
  emit('settings');
};
</script>

<template>
  <div class="menu-item">
    <button class="menu-item__button" @click="goBack">⏪</button>
    <button class="menu-item__button" @click="togglePlay">
      {{ props.isPlaying ? '⏸️' : '▶️' }}
    </button>
    <button class="menu-item__button" @click="openSettings">⚙️</button>
    <button class="menu-item__button" @click="goForward">⏩</button>
  </div>
</template>

<style scoped>
.menu-item {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}
.menu-item__button {
  font-size: 16px;
  padding: 8px 12px;
  background-color: transparent;
  color: #fff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}
.menu-item__button:hover {
  background-color: #444;
}
</style>

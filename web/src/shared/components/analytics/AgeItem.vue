<script setup lang="ts">
const props = defineProps<{
  selectedAgeSettings?: { youngColorHex: string; oldColorHex: string; maxAge: number };
}>();

const emit = defineEmits<{
  (
    event: 'set-age-settings',
    value: { youngColorHex: string; oldColorHex: string; maxAge: number } | undefined,
  ): void;
}>();

const toggleAgeDataHandler = (): void => {
  if (props.selectedAgeSettings !== undefined) {
    emit('set-age-settings', undefined);
  } else {
    emit('set-age-settings', { youngColorHex: '#00ff00', oldColorHex: '#ff0000', maxAge: 100 });
  }
};

const setYoungColorHexHandler = (colorHex: string): void => {
  if (props.selectedAgeSettings) {
    emit('set-age-settings', {
      youngColorHex: colorHex,
      oldColorHex: props.selectedAgeSettings.oldColorHex,
      maxAge: props.selectedAgeSettings.maxAge,
    });
  }
};

const setOldColorHexHandler = (colorHex: string): void => {
  if (props.selectedAgeSettings) {
    emit('set-age-settings', {
      youngColorHex: props.selectedAgeSettings.youngColorHex,
      oldColorHex: colorHex,
      maxAge: props.selectedAgeSettings.maxAge,
    });
  }
};

const setMaxAgeHandler = (maxAge: number): void => {
  if (props.selectedAgeSettings) {
    emit('set-age-settings', {
      youngColorHex: props.selectedAgeSettings.youngColorHex,
      oldColorHex: props.selectedAgeSettings.oldColorHex,
      maxAge,
    });
  }
};
</script>

<template>
  <div class="age-item">
    <label class="age-item__toggle">
      <input
        type="checkbox"
        :value="props.selectedAgeSettings !== undefined"
        @change="toggleAgeDataHandler"
      />
      Enable age-based coloring
    </label>
    <div v-if="props.selectedAgeSettings" class="age-item__controls">
      <label>
        Young color:
        <input
          type="color"
          :value="props.selectedAgeSettings.youngColorHex"
          @change="(event) => setYoungColorHexHandler((event.target as HTMLInputElement).value)"
        />
      </label>
      <label>
        Old color:
        <input
          type="color"
          v-model="props.selectedAgeSettings.oldColorHex"
          @change="(event) => setOldColorHexHandler((event.target as HTMLInputElement).value)"
        />
      </label>
      <label>
        Max age: {{ props.selectedAgeSettings.maxAge }}
        <input
          type="range"
          min="1"
          max="100"
          :value="props.selectedAgeSettings.maxAge"
          @change="(event) => setMaxAgeHandler(parseInt((event.target as HTMLInputElement).value))"
        />
      </label>
    </div>
  </div>
</template>

<style scoped></style>

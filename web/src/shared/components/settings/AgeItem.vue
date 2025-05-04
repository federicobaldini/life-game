<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  selectedAgeData?: { youngColorHex: string; oldColorHex: string; maxAge: number };
}>();

const emit = defineEmits<{
  (
    event: 'set-age-data',
    value: { youngColorHex: string; oldColorHex: string; maxAge: number } | undefined,
  ): void;
}>();

const toggleAgeDataHandler = (): void => {
  if (props.selectedAgeData !== undefined) {
    emit('set-age-data', undefined);
  } else {
    emit('set-age-data', { youngColorHex: '#00ff00', oldColorHex: '#ff0000', maxAge: 100 });
  }
};

const setYoungColorHexHandler = (colorHex: string): void => {
  if (props.selectedAgeData) {
    emit('set-age-data', {
      youngColorHex: colorHex,
      oldColorHex: props.selectedAgeData.oldColorHex,
      maxAge: props.selectedAgeData.maxAge,
    });
  }
};

const setOldColorHexHandler = (colorHex: string): void => {
  if (props.selectedAgeData) {
    emit('set-age-data', {
      youngColorHex: props.selectedAgeData.youngColorHex,
      oldColorHex: colorHex,
      maxAge: props.selectedAgeData.maxAge,
    });
  }
};

const setMaxAgeHandler = (maxAge: number): void => {
  if (props.selectedAgeData) {
    emit('set-age-data', {
      youngColorHex: props.selectedAgeData.youngColorHex,
      oldColorHex: props.selectedAgeData.oldColorHex,
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
        :value="props.selectedAgeData !== undefined"
        @change="toggleAgeDataHandler"
      />
      Enable age-based coloring
    </label>
    <div v-if="props.selectedAgeData" class="age-item__controls">
      <label>
        Young color:
        <input
          type="color"
          :value="props.selectedAgeData.youngColorHex"
          @change="(event) => setYoungColorHexHandler((event.target as HTMLInputElement).value)"
        />
      </label>
      <label>
        Old color:
        <input
          type="color"
          v-model="props.selectedAgeData.oldColorHex"
          @change="(event) => setOldColorHexHandler((event.target as HTMLInputElement).value)"
        />
      </label>
      <label>
        Max age: {{ props.selectedAgeData.maxAge }}
        <input
          type="range"
          min="1"
          max="100"
          :value="props.selectedAgeData.maxAge"
          @change="(event) => setMaxAgeHandler(parseInt((event.target as HTMLInputElement).value))"
        />
      </label>
    </div>
  </div>
</template>

<style scoped></style>

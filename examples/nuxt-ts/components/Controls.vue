<script setup lang="ts">
import { type ControlRecord, type ControlValue } from "@zag-js/shared"

defineProps<{ config: ControlRecord; state: ControlValue<any> }>()
</script>

<template>
  <div class="controls-container">
    <div v-for="(value, key) in config" :key="key">
      <template v-if="value.type === 'boolean'">
        <div class="checkbox">
          <input
            :data-testid="key"
            :id="value.label || key"
            type="checkbox"
            :checked="state.value[key]"
            @input="(e) => (state.value[key] = (e.target as HTMLInputElement).checked)"
          />
          <label :for="value.label || key">{{ value.label || key }}</label>
        </div>
      </template>
      <template v-if="value.type === 'string'">
        <div class="text">
          <label style="margin-right: 10px">{{ value.label || key }}</label>
          <input
            :data-testid="key"
            type="text"
            :placeholder="value.placeholder"
            :value="state.value[key]"
            @keydown.enter="(event) => (state.value[key] = (event.target as HTMLInputElement).value)"
          />
        </div>
      </template>
      <template v-if="value.type === 'select'">
        <div class="text">
          <label :for="value.label || key" style="margin-right: 10px">
            {{ value.label || key }}
          </label>
          <select
            :data-testid="key"
            :id="value.label || key"
            :value="state.value[key]"
            @change="(e) => (state.value[key] = (e.target as HTMLSelectElement).value)"
          >
            <option>-----</option>
            <option v-for="option in value.options" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>
      </template>
      <template v-if="value.type === 'number'">
        <div class="text">
          <label :for="value.label || key" style="margin-right: 10px">
            {{ value.label || key }}
          </label>
          <input
            :data-testid="key"
            :id="value.label || key"
            type="number"
            :min="value.min"
            :max="value.max"
            :value="state.value[key]"
            @keydown.enter="(e) => (state.value[key] = (e.target as HTMLInputElement).valueAsNumber)"
          />
        </div>
      </template>
    </div>
  </div>
</template>

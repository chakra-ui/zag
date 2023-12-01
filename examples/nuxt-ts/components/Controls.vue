<script setup lang="ts">
defineProps<{ control: any }>()
</script>

<template>
  <div class="controls-container">
    <div v-for="(value, key) in control.config" :key="key">
      <template v-if="value.type === 'boolean'">
        <div class="checkbox">
          <input
            :data-testid="key"
            :id="value.label || key"
            type="checkbox"
            :checked="control.getState(key)"
            @input="
              (e) => {
                control.setState(key, (e.target as HTMLInputElement).checked)
              }
            "
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
            :value="control.getState(key)"
            @keydown.enter="
              (event) => {
                control.setState(key, (event.target as HTMLInputElement).value)
              }
            "
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
            :value="control.getState(key)"
            @change="
              (e) => {
                control.setState(key, (e.target as HTMLSelectElement).value)
              }
            "
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
            :value="control.getState(key)"
            @keydown.enter="
              (e) => {
                const val = parseFloat((e.target as HTMLInputElement).value)
                control.setState(key, isNaN(val) ? 0 : val)
              }
            "
          />
        </div>
      </template>
    </div>
  </div>
</template>

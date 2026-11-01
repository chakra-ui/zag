<script setup lang="ts">
import * as radio from "@zag-js/radio-group"
import { normalizeProps, useMachine } from "@zag-js/vue"

defineProps<{ testId: string }>()

const service = useMachine(radio.machine, { id: useId() })
const api = computed(() => radio.connect(service, normalizeProps))
</script>

<template>
  <div v-bind="api.getRootProps()">
    <label
      v-for="v in ['one', 'two']"
      :key="v"
      v-bind="api.getItemProps({ value: v })"
      :data-testid="`${testId}-${v}`"
      style="display: flex; gap: 8px"
    >
      <div
        v-bind="api.getItemControlProps({ value: v })"
        style="width: 18px; height: 18px; border: 2px solid #888; border-radius: 9px"
      />
      <span v-bind="api.getItemTextProps({ value: v })">Radio {{ v }}</span>
      <input v-bind="api.getItemHiddenInputProps({ value: v })" />
    </label>
  </div>
</template>

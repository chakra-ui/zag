<script setup lang="ts">
import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/field.css"

const MAX_LENGTH = 40

const length = ref(0)
const disabled = ref(false)

const id = useId()
const service = useMachine(
  field.machine,
  computed(() => ({ id, disabled: disabled.value, invalid: length.value > MAX_LENGTH })),
)
const api = computed(() => field.connect(service, normalizeProps))
</script>

<template>
  <main class="field-page">
    <label><input v-model="disabled" type="checkbox" /> Disabled</label>

    <div v-bind="api.getRootProps()">
      <span v-bind="api.getLabelProps()">Bio</span>
      <div
        v-bind="api.getControlProps()"
        role="textbox"
        aria-multiline="true"
        :contenteditable="api.disabled ? 'false' : 'plaintext-only'"
        @input="length = ($event.currentTarget as HTMLElement).textContent?.length ?? 0"
      />
      <span v-bind="api.getHelperTextProps()">{{ length }}/{{ MAX_LENGTH }}</span>
      <span v-bind="api.getErrorTextProps()">Keep it under {{ MAX_LENGTH }} characters.</span>
    </div>
  </main>
</template>

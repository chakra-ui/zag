<script setup lang="ts">
import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/field.css"

const disabled = ref(false)
const invalid = ref(false)
const required = ref(true)

const id = useId()

const service = useMachine(
  field.machine,
  computed(() => ({
    id,
    disabled: disabled.value,
    invalid: invalid.value,
    required: required.value,
  })),
)

const api = computed(() => field.connect(service, normalizeProps))
</script>

<template>
  <main class="field-page">
    <h1>Field — Basic</h1>
    <div class="options">
      <label> <input v-model="disabled" type="checkbox" /> Disabled </label>
      <label> <input v-model="invalid" type="checkbox" /> Invalid </label>
      <label> <input v-model="required" type="checkbox" /> Required </label>
    </div>
    <form @submit.prevent>
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">
          Username <span v-bind="api.getIndicatorProps({ type: 'required' })">*</span>
        </label>
        <input v-bind="api.getInputProps()" placeholder="e.g. sage" />
        <span v-bind="api.getHelperTextProps()">Choose a short, memorable name.</span>
        <span v-bind="api.getErrorTextProps()">{{ api.errors[0] ?? "Field is invalid" }}</span>
      </div>
      <div class="actions">
        <button type="submit">Submit</button>
        <button type="reset">Reset</button>
      </div>
    </form>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

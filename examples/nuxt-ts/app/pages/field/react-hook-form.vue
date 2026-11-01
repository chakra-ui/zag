<script setup lang="ts">
import * as field from "@zag-js/field"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/field.css"

// Plain reactive form state: validates on submit, then re-validates on change
function validate(value: string) {
  if (!value) return "Username is required"
  if (value.length < 3) return "Use at least 3 characters"
  return undefined
}

const submitted = ref<{ username: string } | null>(null)
const value = ref("")
const error = ref<string>()
const touched = ref(false)
const submitCount = ref(0)

// the form owns validation and interaction flags; the field mirrors them
const id = useId()
const service = useMachine(
  field.machine,
  computed(() => ({
    id,
    required: true,
    invalid: !!error.value,
    dirty: value.value !== "",
    touched: touched.value,
  })),
)

const api = computed(() => field.connect(service, normalizeProps))

const inputProps = computed(() =>
  mergeProps(api.value.getInputProps(), {
    name: "username",
    onInput(event: Event) {
      value.value = (event.currentTarget as HTMLInputElement).value
      if (submitCount.value > 0) error.value = validate(value.value)
    },
    onBlur() {
      touched.value = true
    },
  }),
)

function onSubmit() {
  submitCount.value++
  error.value = validate(value.value)
  if (!error.value) submitted.value = { username: value.value }
}
</script>

<template>
  <main class="field-page">
    <h1>Field — Reactive Form</h1>
    <form novalidate @submit.prevent="onSubmit">
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">
          Username <span v-bind="api.getIndicatorProps({ type: 'required' })">*</span>
        </label>
        <input v-bind="inputProps" placeholder="e.g. sage" />
        <span v-bind="api.getHelperTextProps()">Managed and validated by plain refs.</span>
        <span v-bind="api.getErrorTextProps()">{{ error }}</span>
      </div>
      <span v-if="submitted" data-testid="submitted">Submitted: {{ submitted.username }}</span>
      <div class="actions">
        <button type="submit">Submit</button>
      </div>
    </form>
  </main>
</template>

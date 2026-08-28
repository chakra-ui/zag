<script setup lang="ts">
import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/field.css"

const TAKEN_EMAILS = ["taken@example.com"]

const checkEmail = (value: string) => (TAKEN_EMAILS.includes(value) ? "This email is already taken" : null)

const mode = ref<field.ValidationMode>("onSubmit")
const isAsync = ref(false)
const submitted = ref(false)

const id = useId()

const service = useMachine(
  field.machine,
  computed(() => ({
    id,
    required: true,
    validationMode: mode.value,
    validate({ value }: field.ValidateDetails) {
      if (!isAsync.value) return checkEmail(value)
      return new Promise<field.ValidateResult>((resolve) => setTimeout(() => resolve(checkEmail(value)), 400))
    },
  })),
)

const api = computed(() => field.connect(service, normalizeProps))
</script>

<template>
  <main class="field-page">
    <h1>Field — Validation</h1>
    <div class="options">
      <label>
        Mode
        <select v-model="mode">
          <option value="onSubmit">onSubmit</option>
          <option value="onBlur">onBlur</option>
          <option value="onChange">onChange</option>
        </select>
      </label>
      <label> <input v-model="isAsync" type="checkbox" /> Async validation </label>
    </div>
    <form @submit.prevent="submitted = true">
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">
          Email <span v-bind="api.getIndicatorProps({ type: 'required' })">*</span>
        </label>
        <input v-bind="api.getInputProps()" type="email" placeholder="taken@example.com is taken" />
        <span v-bind="api.getHelperTextProps()">We never share your email.</span>
        <span v-bind="api.getErrorTextProps()">{{ api.errors[0] }}</span>
        <span v-bind="api.getIndicatorProps({ type: 'valid' })">Looks good</span>
      </div>
      <span v-if="api.validating" data-testid="validating">Checking…</span>
      <span v-if="submitted" data-testid="submitted">Submitted!</span>
      <div class="actions">
        <button type="submit">Submit</button>
        <button type="reset" @click="submitted = false">Reset</button>
      </div>
    </form>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

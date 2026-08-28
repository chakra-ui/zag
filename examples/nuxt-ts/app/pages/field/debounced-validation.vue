<script setup lang="ts">
import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/field.css"

const TAKEN_EMAILS = ["taken@example.com"]

const checkEmail = (value: string) => (TAKEN_EMAILS.includes(value) ? "This email is already taken" : null)

const calls = ref(0)
let timer: ReturnType<typeof setTimeout> | undefined

const id = useId()

const service = useMachine(
  field.machine,
  computed(() => ({
    id,
    required: true,
    validationMode: "onChange" as const,
    // Debounce by returning a promise and resetting the timer. The machine drops stale resolutions.
    validate({ value }: field.ValidateDetails) {
      return new Promise<field.ValidateResult>((resolve) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
          calls.value += 1
          resolve(checkEmail(value))
        }, 400)
      })
    },
  })),
)

const api = computed(() => field.connect(service, normalizeProps))
</script>

<template>
  <main class="field-page">
    <h1>Field — Debounced Validation</h1>
    <form @submit.prevent>
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">
          Email <span v-bind="api.getIndicatorProps({ type: 'required' })">*</span>
        </label>
        <input v-bind="api.getInputProps()" placeholder="taken@example.com is taken" />
        <span v-bind="api.getHelperTextProps()">Validation runs 400ms after you stop typing.</span>
        <span v-bind="api.getErrorTextProps()">{{ api.errors[0] }}</span>
        <span v-bind="api.getIndicatorProps({ type: 'valid' })">Looks good</span>
      </div>
      <span v-if="api.validating" data-testid="validating">Checking…</span>
      <span data-testid="validate-calls">Checks: {{ calls }}</span>
      <div class="actions">
        <button type="submit">Submit</button>
        <button
          type="reset"
          @click="
            clearTimeout(timer)
            calls = 0
          "
        >
          Reset
        </button>
      </div>
    </form>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

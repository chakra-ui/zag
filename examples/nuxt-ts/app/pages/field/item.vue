<script setup lang="ts">
import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/field.css"

const id = useId()

const service = useMachine(
  field.machine,
  computed(() => ({
    id,
    required: true,
    target: "amount",
  })),
)

const api = computed(() => field.connect(service, normalizeProps))

function onSubmit(e: Event) {
  console.log(Object.fromEntries(new FormData(e.target as HTMLFormElement)))
}
</script>

<template>
  <main class="field-page">
    <h1>Field — Item</h1>
    <form @submit.prevent="onSubmit">
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">
          Amount <span v-bind="api.getIndicatorProps({ type: 'required' })">*</span>
        </label>
        <div class="field-item-row">
          <select
            v-bind="api.getSelectProps({ item: 'currency' })"
            name="currency"
            data-testid="currency"
            aria-label="Currency"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          <input v-bind="api.getInputProps({ item: 'amount' })" name="amount" data-testid="amount" placeholder="0.00" />
        </div>
        <span v-bind="api.getHelperTextProps()">The field tracks the amount. Currency is a sibling control.</span>
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

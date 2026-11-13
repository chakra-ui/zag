<script setup lang="ts">
import * as field from "@zag-js/field"
import * as fieldsetMachine from "@zag-js/fieldset"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/field.css"
import "@styles/fieldset.css"

const fieldsetId = useId()
const sameAsBilling = ref(false)
const output = ref("")

const fieldsetService = useMachine(
  fieldsetMachine.machine,
  computed(() => ({
    id: fieldsetId,
    disabled: sameAsBilling.value,
  })),
)
const fieldsetApi = computed(() => fieldsetMachine.connect(fieldsetService, normalizeProps))

// disabled inheritance is DOM-based: the fields pick it up from <fieldset disabled>
const streetService = useMachine(field.machine, { id: useId() })
const streetApi = computed(() => field.connect(streetService, normalizeProps))

const postalService = useMachine(field.machine, { id: useId() })
const postalApi = computed(() => field.connect(postalService, normalizeProps))

function onSubmit(e: Event) {
  output.value = JSON.stringify(Object.fromEntries(new FormData(e.currentTarget as HTMLFormElement)), null, 2)
}

function onReset() {
  sameAsBilling.value = false
  output.value = ""
}
</script>

<template>
  <main>
    <div class="field-page shipping-address">
      <p class="hint">Tick "Same as billing address" to disable every field.</p>
      <form @submit.prevent="onSubmit" @reset="onReset">
        <label class="same-as-billing">
          <input v-model="sameAsBilling" type="checkbox" name="sameAsBilling" />
          Same as billing address
        </label>
        <fieldset v-bind="fieldsetApi.getRootProps()">
          <legend v-bind="fieldsetApi.getLegendProps()">Shipping address</legend>
          <span v-bind="fieldsetApi.getHelperTextProps()">Where should we deliver your order?</span>
          <div v-bind="streetApi.getRootProps()">
            <label v-bind="streetApi.getLabelProps()">Street address</label>
            <input v-bind="streetApi.getInputProps()" name="street" placeholder="1600 Pennsylvania Avenue NW" />
          </div>
          <div v-bind="postalApi.getRootProps()">
            <label v-bind="postalApi.getLabelProps()">Postal code</label>
            <input v-bind="postalApi.getInputProps()" name="postalCode" placeholder="20500" />
          </div>
        </fieldset>
        <div class="actions">
          <button type="submit">Save address</button>
          <button type="reset">Reset</button>
        </div>
      </form>
      <pre v-if="output" class="output" data-testid="form-output">{{ output }}</pre>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="fieldsetService" />
    <StateVisualizer :state="streetService" />
    <StateVisualizer :state="postalService" />
  </Toolbar>
</template>

<script setup lang="ts">
import * as field from "@zag-js/field"
import * as fieldsetMachine from "@zag-js/fieldset"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/field.css"

const disabled = ref(false)
const invalid = ref(false)

const fieldsetId = useId()
const fieldId = useId()

const fieldsetService = useMachine(
  fieldsetMachine.machine,
  computed(() => ({
    id: fieldsetId,
    disabled: disabled.value,
    invalid: invalid.value,
  })),
)
const fieldsetApi = computed(() => fieldsetMachine.connect(fieldsetService, normalizeProps))

// disabled inheritance is DOM-based: the field picks it up from <fieldset disabled>
const fieldService = useMachine(field.machine, { id: fieldId, required: true })
const fieldApi = computed(() => field.connect(fieldService, normalizeProps))
</script>

<template>
  <main class="field-page">
    <h1>Fieldset — Basic</h1>
    <div class="options">
      <label> <input v-model="disabled" type="checkbox" /> Disabled </label>
      <label> <input v-model="invalid" type="checkbox" /> Invalid </label>
    </div>
    <form @submit.prevent>
      <fieldset v-bind="fieldsetApi.getRootProps()">
        <legend v-bind="fieldsetApi.getLegendProps()">Contact details</legend>
        <span v-bind="fieldsetApi.getHelperTextProps()">How can we reach you?</span>
        <div v-bind="fieldApi.getRootProps()">
          <label v-bind="fieldApi.getLabelProps()">
            Phone <span v-bind="fieldApi.getIndicatorProps({ type: 'required' })">*</span>
          </label>
          <input v-bind="fieldApi.getInputProps()" type="tel" placeholder="+1 555 000 0000" />
          <span v-bind="fieldApi.getErrorTextProps()">{{ fieldApi.errors[0] }}</span>
        </div>
        <span v-bind="fieldsetApi.getErrorTextProps()">Contact details are incomplete</span>
      </fieldset>
      <div class="actions">
        <button type="submit">Submit</button>
        <button type="reset">Reset</button>
      </div>
    </form>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="fieldsetService" />
    <StateVisualizer :state="fieldService" />
  </Toolbar>
</template>

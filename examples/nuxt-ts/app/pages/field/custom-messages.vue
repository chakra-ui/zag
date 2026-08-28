<script setup lang="ts">
import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/field.css"

const id = useId()

const service = useMachine(field.machine, {
  id,
  required: true,
  validationMode: "onBlur",
})

const api = computed(() => field.connect(service, normalizeProps))
</script>

<template>
  <main class="field-page">
    <h1>Field — Custom messages</h1>
    <form @submit.prevent>
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">
          Website <span v-bind="api.getIndicatorProps({ type: 'required' })">*</span>
        </label>
        <input v-bind="api.getInputProps()" type="url" placeholder="https://example.com" />
        <span v-bind="api.getHelperTextProps()">Shown on your public profile.</span>
        <span v-bind="api.getErrorTextProps({ match: 'valueMissing' })">Please enter your website URL.</span>
        <span v-bind="api.getErrorTextProps({ match: 'typeMismatch' })">
          Enter a full URL, like https://example.com
        </span>
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

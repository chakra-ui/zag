<script setup lang="ts">
import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/field.css"

const frameworks = ["React", "Solid", "Svelte", "Vue", "Preact"]

const id = useId()

const service = useMachine(field.machine, { id, required: true })

const api = computed(() => field.connect(service, normalizeProps))
</script>

<template>
  <main class="field-page">
    <h1>Field — Select</h1>
    <form @submit.prevent>
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">
          Framework <span v-bind="api.getIndicatorProps({ type: 'required' })">*</span>
        </label>
        <select v-bind="api.getSelectProps()">
          <option value="">Select a framework…</option>
          <option v-for="framework in frameworks" :key="framework" :value="framework.toLowerCase()">
            {{ framework }}
          </option>
        </select>
        <span v-bind="api.getHelperTextProps()">The one you reach for first.</span>
        <span v-bind="api.getErrorTextProps()">{{ api.errors[0] }}</span>
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

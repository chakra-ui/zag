<script setup lang="ts">
import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/field.css"

const dirty = ref(false)
const touched = ref(false)

const id = useId()

const service = useMachine(
  field.machine,
  computed(() => ({
    id,
    required: true,
    dirty: dirty.value,
    touched: touched.value,
  })),
)

const api = computed(() => field.connect(service, normalizeProps))
</script>

<template>
  <main class="field-page">
    <h1>Field — Controlled</h1>
    <div class="options">
      <label> <input v-model="dirty" type="checkbox" /> Dirty </label>
      <label> <input v-model="touched" type="checkbox" /> Touched </label>
    </div>
    <form @submit.prevent>
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">
          Username <span v-bind="api.getIndicatorProps({ type: 'required' })">*</span>
        </label>
        <input v-bind="api.getInputProps()" placeholder="e.g. sage" />
        <span v-bind="api.getHelperTextProps()"
          >Dirty and touched are owned by the parent. Typing will not flip them.</span
        >
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

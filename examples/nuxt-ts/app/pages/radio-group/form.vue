<script setup lang="ts">
import * as radio from "@zag-js/radio-group"
import { contactMethods } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { useId } from "vue"
import "@styles/radio-group.css"

const id = useId()
const value = ref<string | null>(null)
const submitted = ref(false)
const output = ref("")

const invalid = computed(() => submitted.value && !value.value)

const service = useMachine(
  radio.machine,
  computed<radio.Props>(() => ({
    id,
    name: "contact",
    defaultValue: null,
    required: true,
    invalid: invalid.value,
    onValueChange: (details) => {
      value.value = details.value
    },
  })),
)

const api = computed(() => radio.connect(service, normalizeProps))

function onSubmit(e: Event) {
  submitted.value = true
  const data = Object.fromEntries(new FormData(e.currentTarget as HTMLFormElement))
  output.value = "contact" in data ? JSON.stringify(data, null, 2) : ""
}

function onReset() {
  submitted.value = false
  output.value = ""
}
</script>

<template>
  <main>
    <div class="radio-form">
      <p class="hint">Save without choosing to see the invalid state, then pick one.</p>
      <form novalidate @submit.prevent="onSubmit" @reset="onReset">
        <div v-bind="api.getRootProps()">
          <span v-bind="api.getLabelProps()">Preferred contact method</span>
          <label
            v-for="opt in contactMethods"
            :key="opt.id"
            :data-testid="`radio-${opt.id}`"
            v-bind="api.getItemProps({ value: opt.id })"
          >
            <div v-bind="api.getItemControlProps({ value: opt.id })" />
            <span v-bind="api.getItemTextProps({ value: opt.id })">{{ opt.label }}</span>
            <input v-bind="api.getItemHiddenInputProps({ value: opt.id })" />
          </label>
        </div>
        <p v-if="invalid" class="error" role="alert">Choose a contact method.</p>
        <div class="actions">
          <button type="submit">Save preference</button>
          <button type="reset">Reset</button>
        </div>
      </form>
      <pre v-if="output" class="output" data-testid="form-output">{{ output }}</pre>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

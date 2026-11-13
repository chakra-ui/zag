<script setup lang="ts">
import * as zagSwitch from "@zag-js/switch"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { useId } from "vue"
import "@styles/switch.css"

const output = ref<string | null>(null)

const service = useMachine(zagSwitch.machine, {
  id: useId(),
  name: "newsletter",
  value: "yes",
  required: true,
})

const api = computed(() => zagSwitch.connect(service, normalizeProps))

function onSubmit(e: Event) {
  const params = new URLSearchParams(
    new FormData(e.currentTarget as HTMLFormElement) as unknown as Record<string, string>,
  )
  output.value = params.toString() || "(no fields sent)"
}
</script>

<template>
  <main>
    <div class="switch-form">
      <p class="hint">Turn it on and subscribe to see what the form sends, then reset.</p>
      <form novalidate @submit.prevent="onSubmit" @reset="output = null">
        <label data-testid="switch-newsletter" v-bind="api.getRootProps()">
          <input v-bind="api.getHiddenInputProps()" />
          <span v-bind="api.getControlProps()">
            <span v-bind="api.getThumbProps()" />
          </span>
          <span v-bind="api.getLabelProps()">Weekly newsletter</span>
        </label>
        <div class="actions">
          <button type="submit">Subscribe</button>
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

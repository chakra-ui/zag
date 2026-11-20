<script setup lang="ts">
import * as pinInput from "@zag-js/pin-input"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/pin-input.css"

const rejected = ref(false)
const output = ref("")

const service = useMachine(pinInput.machine, {
  id: useId(),
  name: "invite",
  count: 6,
  type: "alphanumeric",
  autoSubmit: true,
  normalizeValue: (value) => value.toUpperCase(),
  translations: { inputLabel: (index, length) => `Character ${index + 1} of ${length}` },
  onValueChange: () => (rejected.value = false),
  onValueInvalid: () => (rejected.value = true),
})
const api = computed(() => pinInput.connect(service, normalizeProps))

function onSubmit(event: Event) {
  const data = new FormData(event.currentTarget as HTMLFormElement)
  output.value = [...data.entries()].map(([key, value]) => `${key}=${value}`).join("\n")
}
</script>

<template>
  <main>
    <div class="pin-input-invite-code">
      <p class="hint">Enter the 6-character code from your invite. It joins as soon as the last box is filled.</p>
      <form @submit.prevent="onSubmit">
        <div v-bind="api.getRootProps()">
          <label v-bind="api.getLabelProps()">Invite code</label>
          <div v-bind="api.getControlProps()">
            <template v-for="index in api.items" :key="index">
              <span v-if="index === 3" class="separator" aria-hidden="true">–</span>
              <input v-bind="api.getInputProps({ index })" />
            </template>
          </div>
          <input v-bind="api.getHiddenInputProps()" />
        </div>
        <p v-if="rejected" class="error" role="alert">Use letters and numbers only</p>
        <button type="submit">Join team</button>
      </form>
      <pre v-if="output" data-testid="form-output">{{ output }}</pre>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" :context="['value', 'focusedIndex']" />
  </Toolbar>
</template>

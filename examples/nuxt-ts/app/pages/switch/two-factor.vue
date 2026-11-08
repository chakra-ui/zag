<script setup lang="ts">
import * as zagSwitch from "@zag-js/switch"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { useId } from "vue"
import "@styles/switch.css"

const id = useId()
const checked = ref(false)
const submitted = ref(false)
const saved = ref(false)

const invalid = computed(() => submitted.value && !checked.value)
const descriptionId = `${id}-description`
const errorId = `${id}-error`

const service = useMachine(
  zagSwitch.machine,
  computed<zagSwitch.Props>(() => ({
    id,
    required: true,
    invalid: invalid.value,
    onCheckedChange: (details) => {
      checked.value = details.checked
      saved.value = false
    },
  })),
)

const api = computed(() => zagSwitch.connect(service, normalizeProps))

function onSubmit() {
  submitted.value = true
  saved.value = checked.value
}
</script>

<template>
  <main>
    <div class="switch-two-factor">
      <p class="hint">Save with it off to see the error.</p>
      <form novalidate @submit.prevent="onSubmit">
        <div class="field">
          <label data-testid="switch-two-factor" v-bind="api.getRootProps()">
            <input
              v-bind="api.getHiddenInputProps()"
              :aria-describedby="invalid ? `${descriptionId} ${errorId}` : descriptionId"
            />
            <span v-bind="api.getControlProps()">
              <span v-bind="api.getThumbProps()" />
            </span>
            <span v-bind="api.getLabelProps()">Two-factor authentication</span>
          </label>
          <p class="description" :id="descriptionId">
            Ask for a 6-digit code from your authenticator app when you sign in.
          </p>
          <p v-if="invalid" class="error" :id="errorId" role="alert">Turn on two-factor authentication to continue.</p>
        </div>
        <div class="actions">
          <button type="submit">Save security settings</button>
        </div>
      </form>
      <p v-if="saved" class="status" role="status">Two-factor authentication is on.</p>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

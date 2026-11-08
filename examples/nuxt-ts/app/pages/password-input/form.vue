<script setup lang="ts">
import * as passwordInput from "@zag-js/password-input"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { useId } from "vue"
import { EyeIcon, EyeOffIcon } from "lucide-vue-next"
import "@styles/password-input.css"

const output = ref("")

const service = useMachine(passwordInput.machine, {
  id: useId(),
  name: "password",
  required: true,
  autoComplete: "new-password",
})

const api = computed(() => passwordInput.connect(service, normalizeProps))

function onSubmit(e: Event) {
  const data = Object.fromEntries(new FormData(e.currentTarget as HTMLFormElement))
  // never print a real password, even in a demo
  const masked = { ...data, password: `•••• (${String(data.password).length} characters)` }
  output.value = JSON.stringify(masked, null, 2)
}

function onReset() {
  output.value = ""
}
</script>

<template>
  <main>
    <div class="password-form">
      <p class="hint">Submit empty to see the required check, then save a password.</p>
      <form @submit.prevent="onSubmit" @reset="onReset">
        <div v-bind="api.getRootProps()">
          <label v-bind="api.getLabelProps()">Password</label>
          <div v-bind="api.getControlProps()">
            <input v-bind="api.getInputProps()" />
            <button v-bind="api.getVisibilityTriggerProps()">
              <span v-bind="api.getIndicatorProps()">
                <EyeIcon v-if="api.visible" />
                <EyeOffIcon v-else />
              </span>
            </button>
          </div>
        </div>
        <div class="actions">
          <button type="submit">Save password</button>
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

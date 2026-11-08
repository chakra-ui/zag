<script setup lang="ts">
import * as passwordInput from "@zag-js/password-input"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { useId } from "vue"
import { EyeIcon, EyeOffIcon } from "lucide-vue-next"
import "@styles/password-input.css"

const id = useId()
const value = ref("")

const rules = computed(() => [
  { id: "length", label: "At least 8 characters", met: value.value.length >= 8 },
  { id: "number", label: "Contains a number", met: /\d/.test(value.value) },
])
const invalid = computed(() => value.value.length > 0 && rules.value.some((rule) => !rule.met))

const service = useMachine(
  passwordInput.machine,
  computed(() => ({
    id,
    autoComplete: "new-password" as const,
    invalid: invalid.value,
  })),
)

const api = computed(() => passwordInput.connect(service, normalizeProps))

function onInput(e: Event) {
  value.value = (e.currentTarget as HTMLInputElement).value
}
</script>

<template>
  <main>
    <div class="password-sign-up">
      <p class="hint">Type a password to see which rules it still needs to meet.</p>
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Password</label>
        <div v-bind="api.getControlProps()">
          <input v-bind="api.getInputProps()" @input="onInput" />
          <button v-bind="api.getVisibilityTriggerProps()">
            <span v-bind="api.getIndicatorProps()">
              <EyeIcon v-if="api.visible" />
              <EyeOffIcon v-else />
            </span>
          </button>
        </div>
      </div>
      <ul class="rules">
        <li v-for="rule in rules" :key="rule.id" :data-testid="`rule-${rule.id}`" :data-met="rule.met">
          {{ rule.label }} ({{ rule.met ? "met" : "not met" }})
        </li>
      </ul>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

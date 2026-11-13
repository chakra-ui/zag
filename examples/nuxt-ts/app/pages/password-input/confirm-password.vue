<script setup lang="ts">
import * as passwordInput from "@zag-js/password-input"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { useId } from "vue"
import { EyeIcon, EyeOffIcon } from "lucide-vue-next"
import "@styles/password-input.css"

const visible = ref(false)
const password = ref("")
const confirm = ref("")

const bothFilled = computed(() => password.value.length > 0 && confirm.value.length > 0)
const matches = computed(() => password.value === confirm.value)
const status = computed(() =>
  !bothFilled.value ? "Enter both passwords" : matches.value ? "Passwords match" : "Passwords don't match",
)

const passwordId = useId()
const confirmId = useId()

const passwordService = useMachine(
  passwordInput.machine,
  computed(() => ({
    id: passwordId,
    autoComplete: "new-password" as const,
    visible: visible.value,
    onVisibilityChange: (details: { visible: boolean }) => {
      visible.value = details.visible
    },
  })),
)
const passwordApi = computed(() => passwordInput.connect(passwordService, normalizeProps))

const confirmService = useMachine(
  passwordInput.machine,
  computed(() => ({
    id: confirmId,
    autoComplete: "new-password" as const,
    visible: visible.value,
    onVisibilityChange: (details: { visible: boolean }) => {
      visible.value = details.visible
    },
    invalid: bothFilled.value && !matches.value,
    translations: { visibilityTrigger: (v: boolean) => (v ? "Hide confirmation" : "Show confirmation") },
  })),
)
const confirmApi = computed(() => passwordInput.connect(confirmService, normalizeProps))

function onPassword(e: Event) {
  password.value = (e.currentTarget as HTMLInputElement).value
}
function onConfirm(e: Event) {
  confirm.value = (e.currentTarget as HTMLInputElement).value
}
</script>

<template>
  <main>
    <div class="password-confirm">
      <p class="hint">Show either password and both fields reveal together.</p>
      <div v-bind="passwordApi.getRootProps()">
        <label v-bind="passwordApi.getLabelProps()">New password</label>
        <div v-bind="passwordApi.getControlProps()">
          <input v-bind="passwordApi.getInputProps()" @input="onPassword" />
          <button v-bind="passwordApi.getVisibilityTriggerProps()">
            <span v-bind="passwordApi.getIndicatorProps()">
              <EyeIcon v-if="passwordApi.visible" />
              <EyeOffIcon v-else />
            </span>
          </button>
        </div>
      </div>
      <div v-bind="confirmApi.getRootProps()">
        <label v-bind="confirmApi.getLabelProps()">Confirm password</label>
        <div v-bind="confirmApi.getControlProps()">
          <input v-bind="confirmApi.getInputProps()" @input="onConfirm" />
          <button v-bind="confirmApi.getVisibilityTriggerProps()">
            <span v-bind="confirmApi.getIndicatorProps()">
              <EyeIcon v-if="confirmApi.visible" />
              <EyeOffIcon v-else />
            </span>
          </button>
        </div>
      </div>
      <p class="match" role="status">{{ status }}</p>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="passwordService" />
    <StateVisualizer :state="confirmService" />
  </Toolbar>
</template>

<script setup lang="ts">
import * as steps from "@zag-js/steps"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/steps.css"

const backupCodes = ["7F3K-92QD", "M4XP-6TBR", "Q8WN-1JZC", "H2VL-5RYE"]

const password = ref("")
const code = ref("")
const verifying = ref(false)
const verified = ref(false)

// Once verified, 2FA is on: the earlier steps can no longer be revisited
const items = computed<steps.StepItem[]>(() => [
  { value: "password", title: "Confirm password", invalid: !password.value, editable: !verified.value },
  { value: "scan", title: "Scan QR code", editable: !verified.value },
  { value: "verify", title: "Enter code", invalid: !/^\d{6}$/.test(code.value), editable: !verified.value },
])

const id = useId()

const service = useMachine(
  steps.machine,
  computed(() => ({
    id,
    items: items.value,
    linear: true,
  })),
)

const api = computed(() => steps.connect(service, normalizeProps))

const verify = async () => {
  verifying.value = true
  await new Promise((resolve) => setTimeout(resolve, 600))
  verifying.value = false
  verified.value = true
  api.value.goToNextStep()
}

const cancel = () => {
  password.value = ""
  code.value = ""
  verified.value = false
  api.value.resetStep()
}
</script>

<template>
  <main class="steps">
    <div v-bind="api.getRootProps()">
      <h2>Enable two-factor authentication</h2>

      <div v-bind="api.getListProps()">
        <div v-for="(item, index) in api.items" :key="item.value" v-bind="api.getItemProps({ value: item.value })">
          <button v-bind="api.getTriggerProps({ value: item.value })">
            <div v-bind="api.getIndicatorProps({ value: item.value })">{{ index + 1 }}</div>
            <span>{{ item.title }}</span>
          </button>
          <div v-bind="api.getSeparatorProps({ value: item.value })" />
        </div>
      </div>

      <div v-bind="api.getContentProps({ value: 'password' })" class="steps-form">
        <label>
          Password
          <input v-model="password" type="password" />
        </label>
      </div>

      <div v-bind="api.getContentProps({ value: 'scan' })">
        <p>Scan this code with your authenticator app, or enter the key manually.</p>
        <code>JBSW Y3DP EHPK 3PXP</code>
      </div>

      <div v-bind="api.getContentProps({ value: 'verify' })" class="steps-form">
        <label>
          6-digit code
          <input v-model="code" inputmode="numeric" :maxlength="6" />
        </label>
      </div>

      <div v-bind="api.getContentProps({ value: steps.COMPLETE })">
        <p>Two-factor authentication is on. Save these backup codes:</p>
        <ul>
          <li v-for="backupCode in backupCodes" :key="backupCode">
            <code>{{ backupCode }}</code>
          </li>
        </ul>
      </div>

      <div class="steps-actions">
        <button v-if="api.complete" v-bind="api.getPrevTriggerProps()">Back</button>
        <template v-else>
          <button @click="cancel">Cancel</button>
          <button v-bind="api.getPrevTriggerProps()">Back</button>
          <button v-if="api.value === 'verify'" :disabled="verifying || api.item?.invalid" @click="verify">
            {{ verifying ? "Verifying…" : "Verify" }}
          </button>
          <button v-else v-bind="api.getNextTriggerProps()">Continue</button>
        </template>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

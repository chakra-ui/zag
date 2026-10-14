<script setup lang="ts">
import * as qrCode from "@zag-js/qr-code"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/qr-code.css"

type Security = "WPA" | "WEP" | "nopass"

// Characters with special meaning in the Wi-Fi payload must be escaped
const escape = (text: string) => text.replace(/([\;,:"])/g, "\\$1")

function toWifiPayload(ssid: string, password: string, security: Security) {
  const pass = security === "nopass" ? "" : `P:${escape(password)};`
  return `WIFI:T:${security};S:${escape(ssid)};${pass};`
}

const ssid = ref("Zag Guest")
const password = ref("state-machines")
const security = ref<Security>("WPA")
const ids = { ssid: useId(), password: useId(), security: useId() }
const id = useId()

const service = useMachine(
  qrCode.machine,
  computed(() => ({ id, value: toWifiPayload(ssid.value, password.value, security.value) })),
)

const api = computed(() => qrCode.connect(service, normalizeProps))
</script>

<template>
  <main class="qr-code">
    <div class="hstack gap-8 items-start">
      <div class="vstack gap-3">
        <div class="vstack gap-2">
          <label :for="ids.ssid">Network name</label>
          <input :id="ids.ssid" v-model="ssid" />
        </div>
        <div class="vstack gap-2">
          <label :for="ids.security">Security</label>
          <select :id="ids.security" v-model="security">
            <option value="WPA">WPA / WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass">None</option>
          </select>
        </div>
        <div v-if="security !== 'nopass'" class="vstack gap-2">
          <label :for="ids.password">Password</label>
          <input :id="ids.password" v-model="password" />
        </div>
      </div>

      <div class="vstack">
        <div v-bind="api.getRootProps()">
          <svg v-bind="api.getFrameProps()">
            <path v-bind="api.getPatternProps()" />
          </svg>
        </div>
        <span class="qr-caption">Scan to join {{ ssid || "the network" }}</span>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import * as clipboard from "@zag-js/clipboard"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ClipboardCheck, ClipboardCopyIcon } from "lucide-vue-next"
import "@styles/clipboard.css"

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

const generateKey = () =>
  "zag_live_" + Array.from({ length: 24 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")

const value = ref("zag_live_51Hx8Kq2eZvKGdY4Tn9PzLm3W")
const status = ref("")

const id = useId()
const service = useMachine(
  clipboard.machine,
  computed<clipboard.Props>(() => ({
    id,
    value: value.value,
    onStatusChange: (details) => {
      status.value = details.copied ? "Copied!" : ""
    },
  })),
)

const api = computed(() => clipboard.connect(service, normalizeProps))

const regenerate = () => {
  value.value = generateKey()
  status.value = ""
}
</script>

<template>
  <main class="api-key">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Secret API key</label>
      <div v-bind="api.getControlProps()">
        <input v-bind="api.getInputProps()" />
        <button v-bind="api.getTriggerProps()">
          <ClipboardCheck v-if="api.copied" />
          <ClipboardCopyIcon v-else />
        </button>
      </div>
      <div class="actions">
        <button type="button" @click="regenerate">Regenerate</button>
        <span data-testid="status">{{ status }}</span>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

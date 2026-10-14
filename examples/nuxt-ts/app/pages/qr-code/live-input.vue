<script setup lang="ts">
import * as qrCode from "@zag-js/qr-code"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/qr-code.css"

const value = ref("https://zagjs.com")
const inputId = useId()
const id = useId()

const service = useMachine(
  qrCode.machine,
  computed(() => ({ id, value: value.value })),
)

const api = computed(() => qrCode.connect(service, normalizeProps))
</script>

<template>
  <main class="qr-code">
    <div class="vstack gap-4">
      <div class="vstack gap-2">
        <label :for="inputId">Text or URL</label>
        <input :id="inputId" v-model="value" placeholder="Type something…" style="width: 240px" />
      </div>

      <div v-bind="api.getRootProps()">
        <svg v-bind="api.getFrameProps()">
          <path v-bind="api.getPatternProps()" />
        </svg>
      </div>

      <span class="qr-caption">{{ value.length }} characters</span>
    </div>
  </main>
</template>

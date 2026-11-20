<script setup lang="ts">
import * as signaturePad from "@zag-js/signature-pad"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { RotateCcw } from "lucide-vue-next"
import "@styles/signature-pad.css"

const id = useId()
const dataUrl = ref("")
const showError = ref(false)
const output = ref("")

const service = useMachine(
  signaturePad.machine,
  computed<signaturePad.Props>(() => ({
    id,
    name: "signature",
    required: true,
    onDrawEnd: (details) => {
      showError.value = false
      details.getDataUrl("image/png").then((url) => (dataUrl.value = url))
    },
  })),
)
const api = computed(() => signaturePad.connect(service, normalizeProps))

function onSubmit(event: Event) {
  if (api.value.empty) {
    showError.value = true
    return
  }
  const data = new FormData(event.currentTarget as HTMLFormElement)
  output.value = [...data.entries()]
    .map(([key, value]) => `${key}=${String(value).slice(0, key === "signature" ? 32 : undefined)}`)
    .join("\n")
}

function onReset() {
  api.value.clear()
  dataUrl.value = ""
  showError.value = false
  output.value = ""
}
</script>

<template>
  <main>
    <div class="signature-pad-sign-document">
      <form novalidate @submit.prevent="onSubmit" @reset="onReset">
        <label class="field">
          <span>Full name</span>
          <input name="signer" autocomplete="name" />
        </label>

        <div v-bind="api.getRootProps()">
          <input v-bind="api.getHiddenInputProps({ value: api.empty ? '' : dataUrl })" />
          <label v-bind="api.getLabelProps()">Lease signature</label>
          <div v-bind="api.getControlProps()">
            <svg v-bind="api.getSegmentProps()">
              <path v-for="(path, index) of api.paths" :key="index" v-bind="api.getSegmentPathProps({ path })" />
              <path v-if="api.currentPath" v-bind="api.getSegmentPathProps({ path: api.currentPath })" />
            </svg>
            <div v-bind="api.getGuideProps()" />
          </div>
          <button v-bind="api.getClearTriggerProps()">
            <RotateCcw />
          </button>
        </div>
        <p v-if="showError" class="error">Sign above to continue</p>

        <div class="actions">
          <button type="submit">Sign lease</button>
          <button type="reset">Start over</button>
        </div>
      </form>
      <pre v-if="output">{{ output }}</pre>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" :omit="['currentPoints', 'currentPath', 'paths']" />
  </Toolbar>
</template>

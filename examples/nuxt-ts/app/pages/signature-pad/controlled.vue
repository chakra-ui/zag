<script setup lang="ts">
import * as signaturePad from "@zag-js/signature-pad"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { RotateCcw } from "lucide-vue-next"

const paths = ref<string[]>([])
const url = ref("")
const setUrl = (v: string) => (url.value = v)
const id = useId()

const service = useMachine(
  signaturePad.machine,
  computed(() => ({
    id,
    paths: paths.value,
    onDraw(details: signaturePad.DrawDetails) {
      paths.value = details.paths
    },
    onDrawEnd(details: signaturePad.DrawEndDetails) {
      details.getDataUrl("image/png").then(setUrl)
    },
    drawing: {
      fill: "red",
      size: 4,
      simulatePressure: true,
    },
  })),
)

const api = computed(() => signaturePad.connect(service, normalizeProps))
</script>

<template>
  <main class="signature-pad">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Controlled Signature Pad</label>

      <div v-bind="api.getControlProps()">
        <svg v-bind="api.getSegmentProps()">
          <path v-for="(path, i) of api.paths" :key="i" v-bind="api.getSegmentPathProps({ path })" />
          <path v-if="api.currentPath" v-bind="api.getSegmentPathProps({ path: api.currentPath })" />
        </svg>
        <div v-bind="api.getGuideProps()" />
      </div>

      <button v-bind="api.getClearTriggerProps()">
        <RotateCcw />
      </button>
    </div>

    <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem">
      <button data-testid="clear-paths" type="button" @click="paths = []">Clear (controlled)</button>
      <button
        type="button"
        @click="
          () => {
            api.getDataUrl('image/png').then(setUrl)
          }
        "
      >
        Show Image
      </button>
    </div>

    <div
      data-testid="controlled-status"
      style="margin-top: 1rem; padding: 0.5rem; background: #f5f5f5; border-radius: 4px"
    >
      <div><strong>Paths:</strong> {{ paths.length }}</div>
      <div><strong>Drawing:</strong> {{ api.drawing ? "yes" : "no" }}</div>
      <div><strong>Current path:</strong> {{ api.currentPath ? "active" : "none" }}</div>
    </div>

    <img v-if="url" data-part="preview" alt="signature" :src="url" />
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :context="['paths', 'currentPath']" :omit="['currentPoints']" />
  </Toolbar>
</template>

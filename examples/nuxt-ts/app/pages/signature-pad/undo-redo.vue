<script setup lang="ts">
import * as signaturePad from "@zag-js/signature-pad"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { RotateCcw } from "lucide-vue-next"
import "@styles/signature-pad.css"

const id = useId()
const paths = ref<string[]>([])
const undone = ref<string[]>([])

const service = useMachine(
  signaturePad.machine,
  computed<signaturePad.Props>(() => ({
    id,
    paths: paths.value,
    onDraw: (details) => (paths.value = details.paths),
    onDrawEnd: () => (undone.value = []),
  })),
)
const api = computed(() => signaturePad.connect(service, normalizeProps))

function undo() {
  undone.value = [...undone.value, paths.value[paths.value.length - 1]]
  paths.value = paths.value.slice(0, -1)
}

function redo() {
  paths.value = [...paths.value, undone.value[undone.value.length - 1]]
  undone.value = undone.value.slice(0, -1)
}
</script>

<template>
  <main>
    <div class="signature-pad-undo-redo">
      <p class="hint">Draw a few strokes, then step back and forward through them.</p>
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Signature</label>
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
      <div class="actions">
        <button type="button" :disabled="paths.length === 0" @click="undo">Undo</button>
        <button type="button" :disabled="undone.length === 0" @click="redo">Redo</button>
        <span data-testid="stroke-count">{{ paths.length }} {{ paths.length === 1 ? "stroke" : "strokes" }}</span>
      </div>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" :omit="['currentPoints', 'currentPath', 'paths']" />
  </Toolbar>
</template>

<script setup lang="ts">
import styles from "../../../../../shared/src/css/signature-pad.module.css"
import { signaturePadControls } from "@zag-js/shared"
import * as signaturePad from "@zag-js/signature-pad"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { RotateCcw } from "lucide-vue-next"

const url = ref("")
const setUrl = (v: string) => (url.value = v)

const controls = useControls(signaturePadControls)

const service = useMachine(
  signaturePad.machine,
  controls.mergeProps<signaturePad.Props>({
    id: useId(),
    onDrawEnd(details) {
      details.getDataUrl("image/png").then(setUrl)
    },
    drawing: {
      fill: "red",
      size: 4,
      simulatePressure: true,
    },
  }),
)

const api = computed(() => signaturePad.connect(service, normalizeProps))
</script>

<template>
  <main class="signature-pad">
    <div v-bind="api.getRootProps()" :class="styles.Root">
      <label v-bind="api.getLabelProps()" :class="styles.Label">Signature Pad</label>

      <div v-bind="api.getControlProps()" :class="styles.Control">
        <svg v-bind="api.getSegmentProps()">
          <path v-for="(path, i) of api.paths" :key="i" v-bind="api.getSegmentPathProps({ path })" />
          <path v-if="api.currentPath" v-bind="api.getSegmentPathProps({ path: api.currentPath })" />
        </svg>
        <div v-bind="api.getGuideProps()" :class="styles.Guide" />
      </div>

      <button v-bind="api.getClearTriggerProps()" :class="styles.ClearTrigger">
        <RotateCcw />
      </button>
    </div>

    <button
      @click="
        () => {
          api.getDataUrl('image/png').then(setUrl)
        }
      "
    >
      Show Image
    </button>
    <img v-if="url" data-part="preview" alt="signature" :src="url" />
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :omit="['currentPoints', 'currentPath', 'paths']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

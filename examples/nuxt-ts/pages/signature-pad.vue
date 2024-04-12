<script setup lang="ts">
import * as signaturePad from "@zag-js/signature-pad"
import { signaturePadControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const url = ref("")
const setUrl = (v: string) => (url.value = v)

const controls = useControls(signaturePadControls)

const [state, send] = useMachine(signaturePad.machine({ id: "1" }), {
  context: controls.context,
})

const api = computed(() => signaturePad.connect(state.value, send, normalizeProps))
</script>

<template>
  <main className="signature-pad">
    <div v-bind="api.rootProps">
      <label v-bind="api.labelProps">Signature Pad</label>

      <div v-bind="api.controlProps">
        <svg v-bind="api.segmentProps">
          <path v-for="path of api.paths" key="{i}" v-bind="api.getSegmentPathProps({ path })" />
          <path v-if="api.currentPath" v-bind="api.getSegmentPathProps({ path: api.currentPath })" />
        </svg>
        <div v-bind="api.guideProps" />
      </div>

      <button v-bind="api.clearTriggerProps">
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
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

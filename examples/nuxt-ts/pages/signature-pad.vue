<script setup lang="ts">
import { signaturePadControls } from "@zag-js/shared"
import * as signaturePad from "@zag-js/signature-pad"
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
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Signature Pad</label>

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

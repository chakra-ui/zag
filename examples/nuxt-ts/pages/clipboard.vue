<script setup lang="ts">
import * as clipboard from "@zag-js/clipboard"
import { clipboardControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ClipboardCheck, ClipboardCopyIcon } from "lucide-vue-next"

const controls = useControls(clipboardControls)

const [state, send] = useMachine(
  clipboard.machine({
    id: "1",
    value: "https://github.com/chakra-ui/zag",
  }),
  {
    context: controls.context,
  },
)

const api = computed(() => clipboard.connect(state.value, send, normalizeProps))
</script>

<template>
  <main className="clipboard">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Copy this link</label>
      <div v-bind="api.getControlProps()">
        <input v-bind="api.getInputProps()" style="width: 100%" />
        <button v-bind="api.getTriggerProps()">
          <ClipboardCheck v-if="api.copied" />
          <ClipboardCopyIcon v-else />
        </button>
      </div>
      <div v-bind="api.getIndicatorProps({ copied: true })">Copied!</div>
      <div v-bind="api.getIndicatorProps({ copied: false })">Copy</div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

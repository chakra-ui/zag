<script setup lang="ts">
import * as clipboard from "@zag-js/clipboard"
import { clipboardControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ClipboardCheck, ClipboardCopyIcon } from "lucide-vue-next"
import "@styles/clipboard.css"

const controls = useControls(clipboardControls)
const reports = ref<string[]>([])

const service = useMachine(
  clipboard.machine,
  controls.mergeProps<clipboard.Props>({
    id: useId(),
    value: "https://github.com/chakra-ui/zag",
    onStatusChange(details) {
      reports.value = [...reports.value, details.error ? "error" : details.copied ? "copied" : "reset"]
    },
  }),
)

const api = computed(() => clipboard.connect(service, normalizeProps))
</script>

<template>
  <main class="clipboard">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Copy this link</label>
      <div v-bind="api.getControlProps()">
        <input v-bind="api.getInputProps()" />
        <button v-bind="api.getTriggerProps()">
          <ClipboardCheck v-if="api.copied" />
          <ClipboardCopyIcon v-else />
        </button>
      </div>
      <div v-bind="api.getIndicatorProps({ copied: true })">Copied!</div>
      <div v-bind="api.getIndicatorProps({ copied: false })">Copy</div>
    </div>
    <p>
      onStatusChange: <output aria-label="Status reports">{{ reports.join(",") || "-" }}</output>
    </p>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

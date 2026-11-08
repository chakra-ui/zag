<script setup lang="ts">
import * as clipboard from "@zag-js/clipboard"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ClipboardCheck, ClipboardCopyIcon } from "lucide-vue-next"
import "@styles/clipboard.css"

const service = useMachine(clipboard.machine, {
  id: useId(),
  value: "https://zagjs.com/components/react/clipboard",
  timeout: 1500,
  translations: {
    triggerLabel: (copied) => (copied ? "Link copied" : "Copy link"),
  },
})

const api = computed(() => clipboard.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div class="share-link">
      <div v-bind="api.getRootProps()">
        <p>Anyone with this link can view the Clipboard docs.</p>
        <button v-bind="api.getTriggerProps()">
          <ClipboardCheck v-if="api.copied" />
          <ClipboardCopyIcon v-else />
          <span>{{ api.copied ? "Link copied" : "Copy link" }}</span>
        </button>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

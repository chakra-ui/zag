<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/dialog.css"

const modal = ref<boolean | "trap-focus">("trap-focus")

const id = useId()
const service = useMachine(
  dialog.machine,
  computed(() => ({
    id,
    defaultOpen: true,
    modal: modal.value,
  })),
)

const api = computed(() => dialog.connect(service, normalizeProps))

const minimized = computed(() => modal.value === false)

function toggleMinimized() {
  modal.value = minimized.value ? "trap-focus" : false
}

const nextModal = (modal: boolean | "trap-focus") =>
  modal === false ? "trap-focus" : modal === "trap-focus" ? true : false
</script>

<template>
  <main class="dialog">
    <div style="display: flex; gap: 8px; flex-wrap: wrap">
      <button data-testid="toggle-minimized" @click="toggleMinimized">
        {{ minimized ? "Maximize" : "Minimize" }}
      </button>
      <button data-testid="toggle-modal" @click="modal = nextModal(modal)">modal: {{ String(modal) }}</button>
      <button v-bind="api.getTriggerProps()" data-testid="trigger">Open dialog</button>
    </div>

    <button data-testid="outside-button" style="margin-top: 16px">
      Outside button (reachable by Tab only when modal is false)
    </button>

    <div style="height: 150vh; padding-top: 16px">Long page, so body scroll lock is observable.</div>

    <Teleport v-if="api.open" to="body">
      <div v-bind="api.getBackdropProps()" :style="{ display: modal === true ? undefined : 'none' }" />
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()" data-testid="content">
          <h2 v-bind="api.getTitleProps()">Player</h2>
          <p v-bind="api.getDescriptionProps()">Minimizing releases focus and scroll without closing or remounting.</p>
          <DialogUptime />
          <input data-testid="inside-input" placeholder="Inside the dialog..." />
          <button data-testid="inside-toggle-minimized" @click="toggleMinimized">
            {{ minimized ? "Maximize" : "Minimize" }}
          </button>
          <button v-bind="api.getCloseTriggerProps()" data-testid="close">
            <XIcon />
          </button>
        </div>
      </div>
    </Teleport>
  </main>
</template>

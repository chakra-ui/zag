<script setup lang="ts">
import { trackDismissableElement } from "@zag-js/dismissable"
import "@styles/dismissable.css"

const open = ref(false)
const draft = ref("")
const blocked = ref(false)

const triggerRef = ref<HTMLButtonElement | null>(null)
const panelRef = ref<HTMLDivElement | null>(null)

watchEffect(
  (onCleanup) => {
    if (!open.value) return
    const cleanup = trackDismissableElement(panelRef.value, {
      exclude: [triggerRef.value],
      onLayerChange: () => {},
      onInteractOutside(event) {
        if (!draft.value) return
        event.preventDefault()
        blocked.value = true
      },
      onEscapeKeyDown(event) {
        if (!draft.value) return
        event.preventDefault()
        blocked.value = true
      },
      onDismiss: () => (open.value = false),
    })
    onCleanup(cleanup)
  },
  { flush: "post" },
)

function toggle() {
  if (open.value && draft.value) {
    blocked.value = true
    return
  }
  blocked.value = false
  open.value = !open.value
}

function onInput(event: Event) {
  draft.value = (event.target as HTMLTextAreaElement).value
  if (!draft.value) blocked.value = false
}
</script>

<template>
  <main>
    <div class="prevent-dismiss">
      <button ref="triggerRef" data-testid="trigger" @click="toggle">Reply to Ama</button>

      <div ref="panelRef" :hidden="!open" role="dialog" aria-label="Reply" data-testid="panel" class="panel">
        <label for="reply">Your reply</label>
        <textarea id="reply" data-testid="reply" :value="draft" @input="onInput" />
        <p role="status" data-testid="hint" class="hint">
          {{ blocked ? "Your reply is not sent yet. Clear it to close this panel." : "" }}
        </p>
      </div>

      <p data-testid="outside">
        Ama asked whether the Lagos shipment will arrive before the 14th. Click here to try closing the reply.
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/dialog.css"

const WIDGET_SCRIPT = "https://upload-widget.cloudinary.com/global/all.js"

const getCloudinaryIframe = () => document.querySelector<HTMLElement>("[data-test=uw-iframe]")

function loadWidgetScript() {
  return new Promise<any>((resolve, reject) => {
    const win = window as any
    if (win.cloudinary) return resolve(win.cloudinary)
    let script = document.querySelector<HTMLScriptElement>(`script[src="${WIDGET_SCRIPT}"]`)
    if (!script) {
      script = document.createElement("script")
      script.src = WIDGET_SCRIPT
      script.async = true
      document.head.appendChild(script)
    }
    script.addEventListener("load", () => resolve(win.cloudinary))
    script.addEventListener("error", reject)
  })
}

const buttonRef = ref<HTMLButtonElement | null>(null)

const service = useMachine(dialog.machine, {
  id: useId(),
  // The upload widget renders outside the dialog; keep it interactive
  persistentElements: [getCloudinaryIframe],
})

const api = computed(() => dialog.connect(service, normalizeProps))

async function openWidget() {
  const cloudinary = await loadWidgetScript()
  const widget = cloudinary.createUploadWidget(
    { cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME, uploadPreset: "ml_default" },
    (_error: unknown, result: any) => {
      if (result?.event === "close") buttonRef.value?.focus()
    },
  )
  widget.open()
}
</script>

<template>
  <div>
    <button v-bind="api.getTriggerProps()">Open Dialog</button>
    <Teleport to="#teleports">
      <template v-if="api.open">
        <div v-bind="api.getBackdropProps()" />
        <div v-bind="api.getPositionerProps()">
          <div v-bind="api.getContentProps()">
            <h2 v-bind="api.getTitleProps()">Edit profile</h2>
            <p v-bind="api.getDescriptionProps()">Make changes to your profile here. Click save when you are done.</p>

            <button ref="buttonRef" @click="openWidget">Upload an Image</button>

            <button v-bind="api.getCloseTriggerProps()"><XIcon /></button>
          </div>
        </div>
      </template>
    </Teleport>
  </div>
</template>

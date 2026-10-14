<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
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

  let buttonRef = $state<HTMLButtonElement | null>(null)

  const id = $props.id()
  const service = useMachine(dialog.machine, {
    id,
    // The upload widget renders outside the dialog; keep it interactive
    persistentElements: [getCloudinaryIframe],
  })

  const api = $derived(dialog.connect(service, normalizeProps))

  async function openWidget() {
    const cloudinary = await loadWidgetScript()
    const widget = cloudinary.createUploadWidget(
      { cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME, uploadPreset: "ml_default" },
      (_error: unknown, result: any) => {
        if (result?.event === "close") buttonRef?.focus()
      },
    )
    widget.open()
  }
</script>

<div>
  <button {...api.getTriggerProps()}>Open Dialog</button>
  {#if api.open}
    <Portal>
      <div {...api.getBackdropProps()}></div>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <h2 {...api.getTitleProps()}>Edit profile</h2>
          <p {...api.getDescriptionProps()}>Make changes to your profile here. Click save when you are done.</p>

          <button bind:this={buttonRef} onclick={openWidget}>Upload an Image</button>

          <button {...api.getCloseTriggerProps()}>
            <XIcon />
          </button>
        </div>
      </div>
    </Portal>
  {/if}
</div>

<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import Tooltip from "$lib/components/tooltip-dialog-tooltip.svelte"
  import * as dialog from "@zag-js/dialog"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tooltip from "@zag-js/tooltip"
  import { XIcon } from "lucide-svelte"
  import "@styles/tooltip.css"
  import "@styles/dialog.css"

  const id = $props.id()
  const tooltipService = useMachine(tooltip.machine, { id: `${id}-tooltip`, ids: { trigger: "t1" } })
  const dialogService = useMachine(dialog.machine, { id: `${id}-dialog`, ids: { trigger: "t1" } })

  const tooltipApi = $derived(tooltip.connect(tooltipService, normalizeProps))
  const dialogApi = $derived(dialog.connect(dialogService, normalizeProps))
</script>

<main class="tooltip">
  <div class="root">
    <button {...mergeProps(tooltipApi.getTriggerProps(), dialogApi.getTriggerProps())}>Hover me</button>

    {#if tooltipApi.open}
      <Portal>
        <div {...tooltipApi.getPositionerProps()}>
          <div {...tooltipApi.getContentProps()}>Tooltip</div>
        </div>
      </Portal>
    {/if}

    {#if dialogApi.open}
      <Portal>
        <div {...dialogApi.getBackdropProps()}></div>
        <div {...dialogApi.getPositionerProps()}>
          <div {...dialogApi.getContentProps()}>
            <h2 {...dialogApi.getTitleProps()}>Edit profile</h2>
            <p {...dialogApi.getDescriptionProps()}>Make changes to your profile here. Click save when you are done.</p>
            <div>
              <Tooltip />
              <input placeholder="Enter name..." />
              <button>Save</button>
            </div>
            <button {...dialogApi.getCloseTriggerProps()}>
              <XIcon />
            </button>
          </div>
        </div>
      </Portal>
    {/if}
  </div>
</main>

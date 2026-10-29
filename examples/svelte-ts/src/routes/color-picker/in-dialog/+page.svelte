<script lang="ts">
  import ColorPicker from "#lib/components/color-picker-in-dialog-picker.svelte"
  import Portal from "#lib/components/portal.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/color-picker.css"
  import "@styles/dialog.css"

  const title = "Primary Color Selection"

  const id = $props.id()
  const service = useMachine(dialog.machine, { id })
  const api = $derived(dialog.connect(service, normalizeProps))
</script>

<main style="padding: 20px">
  <h1>Color Picker in Dialog Test</h1>
  <p>
    This page tests the portalled color picker inside a portalled dialog issue. Before the fix, clicking on the color
    picker would close the dialog.
  </p>

  <div style="margin-top: 20px">
    <button {...api.getTriggerProps()}>Open Dialog</button>
    {#if api.open}
      <Portal>
        <div {...api.getBackdropProps()}></div>
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div style="padding: 24px; min-width: 400px">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
                <h2 {...api.getTitleProps()}>{title}</h2>
                <button {...api.getCloseTriggerProps()}>
                  <XIcon />
                </button>
              </div>
              <div {...api.getDescriptionProps()} style="margin-bottom: 24px">
                This dialog contains a color picker. The issue was that interacting with the color picker would close
                the dialog.
              </div>
              <div style="margin-bottom: 16px">
                <ColorPicker />
              </div>
            </div>
          </div>
        </div>
      </Portal>
    {/if}
  </div>
</main>

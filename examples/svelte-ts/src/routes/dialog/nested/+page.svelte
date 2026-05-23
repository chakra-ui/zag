<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const id = $props.id()

  // Dialog 1
  const service = useMachine(dialog.machine, { id: `${id}-1` })
  const parentDialog = $derived(dialog.connect(service, normalizeProps))

  // Dialog 2
  const service2 = useMachine(dialog.machine, { id: `${id}-2` })
  const childDialog = $derived(dialog.connect(service2, normalizeProps))
</script>

<main>
  <div>
    <button {...parentDialog.getTriggerProps()} data-testid="trigger-1"> Open Dialog </button>

    <div style="min-height: 1200px;"></div>

    {#if parentDialog.open}
      <Portal>
        <div {...parentDialog.getBackdropProps()}></div>
        <div data-testid="positioner-1" {...parentDialog.getPositionerProps()}>
          <div {...parentDialog.getContentProps()}>
            <h2 {...parentDialog.getTitleProps()}>Edit profile</h2>
            <p {...parentDialog.getDescriptionProps()}>
              Make changes to your profile here. Click save when you are done.
            </p>
            <button {...parentDialog.getCloseTriggerProps()} data-testid="close-1"> X </button>
            <input type="text" placeholder="Enter name..." data-testid="input-1" />
            <button data-testid="save-button-1">Save Changes</button>

            <button {...childDialog.getTriggerProps()} data-testid="trigger-2"> Open Nested </button>

            {#if childDialog.open}
              <Portal>
                <div {...childDialog.getBackdropProps()}></div>
                <div data-testid="positioner-2" {...childDialog.getPositionerProps()}>
                  <div {...childDialog.getContentProps()}>
                    <h2 {...childDialog.getTitleProps()}>Nested</h2>
                    <button {...childDialog.getCloseTriggerProps()} data-testid="close-2"> X </button>
                    <button onclick={() => parentDialog.setOpen(false)} data-testid="special-close">
                      Close Dialog 1
                    </button>
                  </div>
                </div>
              </Portal>
            {/if}
          </div>
        </div>
      </Portal>
    {/if}
  </div>
</main>

<Toolbar controls={null}>
  <StateVisualizer label="Dialog 1" state={service} />
  <StateVisualizer label="Dialog 2" state={service2} />
</Toolbar>

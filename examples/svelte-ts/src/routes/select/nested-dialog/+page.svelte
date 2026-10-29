<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import SelectNestedDialogFruit from "#lib/components/select-nested-dialog-fruit.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/select.css"
  import "@styles/dialog.css"

  const parentId = $props.id()
  const parentService = useMachine(dialog.machine, { id: parentId })
  const parent = $derived(dialog.connect(parentService, normalizeProps))
  const childService = useMachine(dialog.machine, { id: `${parentId}-child` })
  const child = $derived(dialog.connect(childService, normalizeProps))
</script>

<main>
  <h1>Select in nested dialogs</h1>
  <button {...parent.getTriggerProps()} data-testid="parent-trigger">Open parent dialog</button>
  {#if parent.open}
    <Portal>
      <div {...parent.getBackdropProps()}></div>
      <div {...parent.getPositionerProps()}>
        <div {...parent.getContentProps()} data-testid="parent-content">
          <h2 {...parent.getTitleProps()}>Parent dialog</h2>
          <p {...parent.getDescriptionProps()}>Open another dialog to choose a fruit.</p>
          <button {...child.getTriggerProps()} data-testid="child-trigger">Open child dialog</button>
          {#if child.open}
            <Portal>
              <div {...child.getBackdropProps()}></div>
              <div {...child.getPositionerProps()}>
                <div {...child.getContentProps()} data-testid="child-content">
                  <h2 {...child.getTitleProps()}>Child dialog</h2>
                  <p {...child.getDescriptionProps()}>The fruit list should appear above this dialog.</p>
                  <SelectNestedDialogFruit />
                </div>
              </div>
            </Portal>
          {/if}
        </div>
      </div>
    </Portal>
  {/if}
</main>

<style>
  :global([data-dialog-content][data-testid="child-content"]) {
    background: #fff4ce;
    min-height: 300px;
  }
  :global([data-testid="select-positioner"][data-state="closed"]) {
    animation: nestedSelectExit 0.3s ease-out;
  }
  @keyframes -global-nestedSelectExit {
    to {
      opacity: 0;
    }
  }
</style>

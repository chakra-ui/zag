<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import Presence from "#lib/components/presence.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const id = $props.id()
  const service = useMachine(dialog.machine, { id })

  const api = $derived(dialog.connect(service, normalizeProps))
</script>

<main>
  <button {...api.getTriggerProps()} data-testid="trigger-1">Open dialog</button>
  <Portal>
    <Presence {...api.getBackdropProps()} lazyMount unmountOnExit></Presence>
    <Presence {...api.getPositionerProps()} hidden={!api.open} lazyMount unmountOnExit data-testid="positioner-1">
      <div {...api.getContentProps()}>
        <h2 {...api.getTitleProps()}>Edit profile</h2>
        <p {...api.getDescriptionProps()}>Make changes to your profile here. Click save when you are done.</p>
        <input placeholder="Enter name..." data-testid="input-1" />
        <button>Save</button>
        <button {...api.getCloseTriggerProps()} data-testid="close-1">Close</button>
      </div>
    </Presence>
  </Portal>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>

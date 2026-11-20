<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import Presence from "#lib/components/presence.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tooltip from "@zag-js/tooltip"
  import "@styles/tooltip.css"

  const id = "tip-1"
  const service = useMachine(tooltip.machine, { id, "aria-label": "Save the document" })
  const api = $derived(tooltip.connect(service, normalizeProps))
</script>

<main class="tooltip">
  <div class="root">
    <button data-testid={`${id}-trigger`} {...api.getTriggerProps()}>Save</button>
    <Portal>
      <div {...api.getPositionerProps()}>
        <Presence class="tooltip-content" data-testid={`${id}-tooltip`} {...api.getContentProps()}>
          Save <kbd>⌘S</kbd>
        </Presence>
      </div>
    </Portal>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>

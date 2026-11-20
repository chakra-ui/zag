<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import Presence from "#lib/components/presence.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import { tooltipControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tooltip from "@zag-js/tooltip"
  import "@styles/tooltip.css"

  const id = "tip-1"
  const controls = useControls(tooltipControls)
  const service = useMachine(tooltip.machine, controls.mergeProps<tooltip.Props>({ id }))
  const api = $derived(tooltip.connect(service, normalizeProps))
</script>

<main class="tooltip">
  <div class="root">
    <button data-testid={`${id}-trigger`} {...api.getTriggerProps()}>Hover me</button>
    <Portal>
      <div {...api.getPositionerProps()}>
        <Presence class="tooltip-content" data-testid={`${id}-tooltip`} {...api.getContentProps()}>Tooltip</Presence>
      </div>
    </Portal>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>

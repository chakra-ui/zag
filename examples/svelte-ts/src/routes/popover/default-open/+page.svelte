<script lang="ts">
  import Presence from "$lib/components/presence.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as popover from "@zag-js/popover"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"
  import "@styles/popover.css"

  const id = $props.id()
  const service = useMachine(popover.machine, { id, defaultOpen: true })

  const api = $derived(popover.connect(service, normalizeProps))
</script>

<main class="popover">
  <div data-part="root">
    <button data-testid="popover-trigger" {...api.getTriggerProps()}>
      Click me
      <div {...api.getIndicatorProps()}>{">"}</div>
    </button>

    <div use:portal={{ disabled: !api.portalled }} {...api.getPositionerProps()}>
      <Presence class="popover-content" data-testid="popover-content" {...api.getContentProps()}>
        <div {...api.getArrowProps()}>
          <div {...api.getArrowTipProps()}></div>
        </div>
        <div data-testid="popover-title" {...api.getTitleProps()}>Popover Title</div>
        <div data-part="body" data-testid="popover-body">
          <a href="#" data-testid="focusable-link">Focusable Link</a>
          <button data-testid="popover-close-button" {...api.getCloseTriggerProps()}> X </button>
        </div>
      </Presence>
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>

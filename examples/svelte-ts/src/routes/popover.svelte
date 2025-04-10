<script lang="ts">
  import { useControls } from "$lib/use-controls.svelte"
  import * as popover from "@zag-js/popover"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"
  import { popoverControls } from "@zag-js/shared"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"

  const controls = useControls(popoverControls)

  const id = $props.id()
  const service = useMachine(popover.machine, { id })

  const api = $derived(popover.connect(service, normalizeProps))
</script>

<main class="popover">
  <div data-part="root">
    <button data-testid="button-before">Button :before</button>

    <button data-testid="popover-trigger" {...api.getTriggerProps()}>
      Click me
      <div {...api.getIndicatorProps()}>{">"}</div>
    </button>

    <div {...api.getAnchorProps()}>anchor</div>

    <div use:portal={{ disabled: !api.portalled }} {...api.getPositionerProps()}>
      <div data-testid="popover-content" class="popover-content" {...api.getContentProps()}>
        <div {...api.getArrowProps()}>
          <div {...api.getArrowTipProps()}></div>
        </div>
        <div data-testid="popover-title" {...api.getTitleProps()}>Popover Title</div>
        <div data-part="body" data-testid="popover-body">
          <!-- svelte-ignore a11y_missing_attribute -->
          <a>Non-focusable Link</a>
          <a href="# " data-testid="focusable-link"> Focusable Link </a>
          <input data-testid="input" placeholder="input" />
          <button data-testid="popover-close-button" {...api.getCloseTriggerProps()}> X </button>
        </div>
      </div>
    </div>

    <span data-testid="plain-text">I am just text</span>
    <button data-testid="button-after">Button :after</button>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>

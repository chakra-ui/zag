<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as popover from "@zag-js/popover"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/popover.css"

  const id = $props.id()
  const service = useMachine(popover.machine, { id })

  const api = $derived(popover.connect(service, normalizeProps))
</script>

<main class="popover">
  <div data-part="root">
    <button data-testid="popover-trigger" {...api.getTriggerProps()}>Click me</button>

    <div {...api.getPositionerProps()}>
      {#if api.open}
        <div data-testid="popover-content" class="popover-content" {...api.getContentProps()}>
          <div data-testid="popover-title" {...api.getTitleProps()}>Popover Title</div>
          <div data-testid="popover-description" {...api.getDescriptionProps()}>Popover Description</div>
          <button data-testid="popover-close-button" {...api.getCloseTriggerProps()}>
            <XIcon />
          </button>
        </div>
      {/if}
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>

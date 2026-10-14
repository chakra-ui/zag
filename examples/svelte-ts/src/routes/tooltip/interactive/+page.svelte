<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import Presence from "$lib/components/presence.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tooltip from "@zag-js/tooltip"
  import "@styles/tooltip.css"

  const id = "tip-interactive"
  const service = useMachine(tooltip.machine, {
    id,
    interactive: true,
    positioning: { gutter: 16 },
  })

  const api = $derived(tooltip.connect(service, normalizeProps))
</script>

<main class="tooltip">
  <div class="root">
    <button data-testid={`${id}-trigger`} {...api.getTriggerProps()}>Hover me</button>
    <span data-testid="sibling">Sibling text</span>
    <Portal>
      <div {...api.getPositionerProps()}>
        <Presence
          {...mergeProps(
            { class: "tooltip-content", "data-testid": `${id}-tooltip`, style: "width: 240px" },
            api.getContentProps(),
          )}
        >
          Interactive tooltip.
          <a href="https://zagjs.com" target="_blank" rel="noreferrer">A link you can reach</a>
        </Presence>
      </div>
    </Portal>
  </div>
</main>

<Toolbar controls={null}>
  <StateVisualizer state={service} />
</Toolbar>

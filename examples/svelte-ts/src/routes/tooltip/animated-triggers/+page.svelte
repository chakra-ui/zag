<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import Presence from "#lib/components/presence.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tooltip from "@zag-js/tooltip"
  import "@styles/tooltip-viewport.css"

  const items = [
    { value: "bold", label: "Bold", tooltip: "Bold" },
    { value: "italic", label: "Italic", tooltip: "Italic text" },
    { value: "underline", label: "Underline", tooltip: "Underline the selected text" },
  ]

  const id = $props.id()
  const service = useMachine(tooltip.machine, {
    id,
    positioning: { placement: "top" },
  })

  const api = $derived(tooltip.connect(service, normalizeProps))
</script>

<main class="tooltip animated-triggers">
  <div class="animated-triggers__list">
    {#each items as item (item.value)}
      <button {...api.getTriggerProps({ value: item.value })}>{item.label}</button>
    {/each}
  </div>

  <Portal>
    <div {...api.getPositionerProps()}>
      <Presence {...api.getArrowProps()}>
        <div {...api.getArrowTipProps()}></div>
      </Presence>
      <Presence {...api.getViewportProps()}>
        {#each items as item (item.value)}
          <Presence {...api.getContentProps({ value: item.value })}>{item.tooltip}</Presence>
        {/each}
      </Presence>
    </div>
  </Portal>
</main>

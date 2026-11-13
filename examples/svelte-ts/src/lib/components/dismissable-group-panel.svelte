<script lang="ts">
  import { trackDismissableElement } from "@zag-js/dismissable"
  import type { Snippet } from "svelte"

  interface Props {
    label: string
    open: boolean
    ondismiss: () => void
    children?: Snippet
  }

  let { label, open, ondismiss, children }: Props = $props()
  let panelRef = $state<HTMLDivElement>()

  const peers = () => Array.from(document.querySelectorAll<HTMLElement>("[data-peer]"))

  $effect(() => {
    if (!open || !panelRef) return
    return trackDismissableElement(panelRef, {
      group: "toolbar-panels",
      exclude: peers,
      onLayerChange: () => {},
      onDismiss: () => ondismiss(),
    })
  })
</script>

<div bind:this={panelRef} data-peer hidden={!open} role="dialog" aria-label={label} class="panel">
  {@render children?.()}
</div>

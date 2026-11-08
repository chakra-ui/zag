<script lang="ts">
  import { trackDismissableElement } from "@zag-js/dismissable"
  import type { Snippet } from "svelte"

  interface Props {
    id: string
    label: string
    children?: Snippet
  }

  let { id, label, children }: Props = $props()
  let open = $state(false)
  let panelRef = $state<HTMLDivElement>()

  const peers = () => Array.from(document.querySelectorAll<HTMLElement>("[data-peer]"))

  $effect(() => {
    if (!open || !panelRef) return
    return trackDismissableElement(panelRef, {
      group: "toolbar-panels",
      exclude: peers,
      onLayerChange: () => {},
      onDismiss: () => (open = false),
    })
  })
</script>

<div>
  <button data-peer data-testid="trigger-{id}" onclick={() => (open = !open)}>{label}</button>
  <div
    bind:this={panelRef}
    data-peer
    hidden={!open}
    role="dialog"
    aria-label={label}
    data-testid="panel-{id}"
    class="panel"
  >
    {@render children?.()}
  </div>
</div>

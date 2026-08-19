<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import {
    getDismissableLayerAttrs,
    getDismissableLayerStyle,
    trackDismissableElement,
    type LayerSnapshot,
  } from "@zag-js/dismissable"
  import { getPlacement } from "@zag-js/popper"
  import type { Snippet } from "svelte"

  interface Props {
    background: string
    children?: Snippet
    id: string
    pointerBlocking?: boolean
  }

  let { background, children, id, pointerBlocking }: Props = $props()
  let open = $state(false)
  let layer = $state<LayerSnapshot | null>(null)
  let contentRef = $state<HTMLDivElement>()
  let triggerRef = $state<HTMLButtonElement>()

  const layerAttrs = $derived(getDismissableLayerAttrs(layer))
  const layerStyle = $derived(getDismissableLayerStyle(layer, { pointerEvents: true }))

  $effect(() => {
    if (!open || !contentRef || !triggerRef) return
    const cleanups = [
      getPlacement(triggerRef, contentRef, { placement: "right" }),
      trackDismissableElement(contentRef, {
        pointerBlocking,
        onLayerChange: (snapshot) => (layer = snapshot),
        onDismiss: () => (open = false),
        exclude: [triggerRef],
      }),
    ]
    return () => cleanups.forEach((cleanup) => cleanup())
  })
</script>

<div style:padding="40px">
  <button bind:this={triggerRef} data-testid={`trigger-${id}`} onclick={() => (open = !open)}>Dismiss</button>
  {#if open}
    <Portal>
      <div
        bind:this={contentRef}
        data-testid={`layer-${id}`}
        data-nested={layerAttrs["data-nested"]}
        data-has-nested={layerAttrs["data-has-nested"]}
        style:position="fixed"
        style:top="0px"
        style:left="0px"
        style:transform="translate3d(var(--x, 0px), var(--y, -100vh), 0)"
        style:z-index="var(--layer-index)"
        style:background
        style:padding="10px"
        style:--layer-index={layerStyle["--layer-index"]}
        style:--nested-layer-count={layerStyle["--nested-layer-count"]}
        style:pointer-events={layerStyle.pointerEvents}
      >
        <h1>Sandbox</h1>
        <p>This is a sandbox page.</p>
        {@render children?.()}
      </div>
    </Portal>
  {/if}
</div>

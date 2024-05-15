<script lang="ts">
  import type { UseControlsReturn } from "$lib/use-controls.svelte"
  import { dataAttr } from "@zag-js/dom-query"
  import Controls from "./controls.svelte"
  import type { Snippet } from "svelte"

  interface Props {
    controls?: UseControlsReturn | null
    viz?: boolean
    children: Snippet
  }

  const { controls, viz, children }: Props = $props()

  let active = $state(viz ? 1 : !controls ? 1 : 0)
</script>

<div class="toolbar">
  <nav>
    {#if controls}
      <button data-active={dataAttr(active === 0)} onclick={() => (active = 0)}>Controls</button>
    {/if}
    <button data-active={dataAttr(active === 1)} onclick={() => (active = 1)}>Visualizer</button>
  </nav>
  {#if controls}
    <div data-content data-active={dataAttr(active === 0)}>
      <Controls {controls} />
    </div>
  {/if}
  <div data-content data-active={dataAttr(active === 1)}>
    {@render children()}
  </div>
</div>

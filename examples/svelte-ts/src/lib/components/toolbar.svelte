<script lang="ts">
  import type { UseControlsReturn } from "$lib/use-controls.svelte"
  import { dataAttr } from "@zag-js/dom-query"
  import { stringifyState } from "@zag-js/shared"
  import { unstate } from "svelte"
  import Controls from "./controls.svelte"

  const {
    controls,
    state: state_,
    omit,
  }: {
    state: any
    controls?: UseControlsReturn
    omit?: string[]
  } = $props()

  let active = $state(controls !== undefined ? 0 : 1)
</script>

<div class="toolbar">
  <nav>
    {#if controls !== undefined}
      <button data-active={dataAttr(active === 0)} onclick={() => (active = 0)}>Controls</button>
    {/if}
    <button data-active={dataAttr(active === 1)} onclick={() => (active = 1)}>Visualizer</button>
  </nav>
  {#if controls !== undefined}
    <div data-content data-active={dataAttr(active === 0)}>
      <Controls {controls} />
    </div>
  {/if}
  <div data-content data-active={dataAttr(active === 1)}>
    <div class="viz">
      <pre>
        <details open>
          <summary>Visualizer</summary>
          <div>{@html stringifyState(unstate(state_), omit)}</div>
        </details>
      </pre>
    </div>
  </div>
</div>

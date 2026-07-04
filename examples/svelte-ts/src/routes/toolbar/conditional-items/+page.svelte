<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toolbar from "@zag-js/toolbar"
  import "@styles/toolbar.css"

  const id = $props.id()
  let showComment = true
  const service = useMachine(toolbar.machine, { id })
  const api = $derived(toolbar.connect(service, normalizeProps))
</script>

<main class="toolbar">
  <div {...api.getRootProps()}>
    <button {...api.getItemProps({ value: "cut" })}>Cut</button>
    <button {...api.getItemProps({ value: "copy" })}>Copy</button>
    <button {...api.getItemProps({ value: "paste" })}>Paste</button>
    {#if showComment}
      <button {...api.getItemProps({ value: "comment" })}>Comment</button>
    {/if}
  </div>
  <label>
    <input type="checkbox" bind:checked={showComment} />
    Show Comment button
  </label>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>


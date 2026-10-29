<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import ControlsPanel from "#lib/components/toolbar.svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toolbar from "@zag-js/toolbar"
  import "@styles/toolbar.css"

  let showComment = $state(true)

  const id = $props.id()
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
  <p>
    Focus "Comment" (the last item), then uncheck the box above to remove it while it's still focused. Tab away and back
    — the toolbar should still have a working tab stop, not become entirely unreachable.
  </p>
</main>

<ControlsPanel>
  <StateVisualizer state={service} />
</ControlsPanel>

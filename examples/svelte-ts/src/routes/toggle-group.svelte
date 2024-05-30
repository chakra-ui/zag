<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import { toggleGroupControls, toggleGroupData } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as toggle from "@zag-js/toggle-group"

  const controls = useControls(toggleGroupControls)

  const [snapshot, send] = useMachine(toggle.machine({ id: "1" }), {
    context: controls.context,
  })

  const api = $derived(toggle.connect(snapshot, send, normalizeProps))
</script>

<main class="toggle-group">
  <button>Outside</button>
  <div {...api.getRootProps()}>
    {#each toggleGroupData as item}
      <button {...api.getItemProps({ value: item.value })}>
        {item.label}
      </button>
    {/each}
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={snapshot} />
</Toolbar>

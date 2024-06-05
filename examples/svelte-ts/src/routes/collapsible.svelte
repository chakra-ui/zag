<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as collapsible from "@zag-js/collapsible"
  import { collapsibleControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const controls = useControls(collapsibleControls)

  const [snapshot, send] = useMachine(collapsible.machine({ id: "1" }), {
    context: controls.context,
  })

  const api = $derived(collapsible.connect(snapshot, send, normalizeProps))
</script>

<main class="collapsible">
  <div {...api.getRootProps()}>
    <button {...api.getTriggerProps()}>Collapsible Trigger</button>
    <div {...api.getContentProps()}>
      <p>
        Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna sfsd. Ut enim ad minimdfd v eniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
        laborum. <a href="/collapsible">Some Link</a>
      </p>
    </div>
  </div>

  <div>
    <div>Toggle Controls</div>
    <button onclick={() => api.setOpen(true)}>Open</button>
    <button onclick={() => api.setOpen(false)}>Close</button>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={snapshot} />
</Toolbar>

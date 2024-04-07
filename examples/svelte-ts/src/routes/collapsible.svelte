<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as collapsible from "@zag-js/collapsible"
  import { collapsibleControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const controls = useControls(collapsibleControls)

  const [_state, send] = useMachine(collapsible.machine({ id: "1" }), {
    context: controls.context,
  })

  const api = $derived(collapsible.connect(_state, send, normalizeProps))
</script>

<main class="collapsible">
  <div {...api.rootProps}>
    <button {...api.triggerProps}>Collapsible Trigger</button>
    <div {...api.contentProps}>
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
    <button onclick={api.open}>Open</button>
    <button onclick={api.close}>Close</button>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={_state} />
</Toolbar>

<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as menu from "@zag-js/menu"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"

  const [_state, send] = useMachine(
    menu.machine({
      id: "1",
      onSelect: console.log,
    }),
  )

  const api = $derived(menu.connect(_state, send, normalizeProps))
</script>

<main class="context-menu">
  <div {...api.contextTriggerProps}>Right Click here</div>
  <div use:portal {...api.positionerProps}>
    <ul {...api.contentProps}>
      <li {...api.getItemProps({ value: "edit" })}>Edit</li>
      <li {...api.getItemProps({ value: "duplicate" })}>Duplicate</li>
      <li {...api.getItemProps({ value: "delete" })}>Delete</li>
      <li {...api.getItemProps({ value: "export" })}>Export...</li>
    </ul>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={_state} />
</Toolbar>

<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as menu from "@zag-js/menu"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"

  const [snapshot, send] = useMachine(
    menu.machine({
      id: "1",
      onSelect: console.log,
    }),
  )

  const api = $derived(menu.connect(snapshot, send, normalizeProps))
</script>

<main class="context-menu">
  <div {...api.getContextTriggerProps()}>Right Click here</div>
  <div use:portal {...api.getPositionerProps()}>
    <ul {...api.getContentProps()}>
      <li {...api.getItemProps({ value: "edit" })}>Edit</li>
      <li {...api.getItemProps({ value: "duplicate" })}>Duplicate</li>
      <li {...api.getItemProps({ value: "delete" })}>Delete</li>
      <li {...api.getItemProps({ value: "export" })}>Export...</li>
    </ul>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={snapshot} />
</Toolbar>

<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/menu.css"

  const id = $props.id()
  const service = useMachine(menu.machine, {
    id,
    onSelect: console.log,
  })

  const api = $derived(menu.connect(service, normalizeProps))
</script>

<main class="context-menu">
  <div {...api.getContextTriggerProps()}>Right Click here</div>
  <Portal>
    <div {...api.getPositionerProps()}>
      <ul {...api.getContentProps()}>
        <li {...api.getItemProps({ value: "edit" })}>Edit</li>
        <li {...api.getItemProps({ value: "duplicate" })}>Duplicate</li>
        <li {...api.getItemProps({ value: "delete" })}>Delete</li>
        <li {...api.getItemProps({ value: "export" })}>Export...</li>
      </ul>
    </div>
  </Portal>
</main>

<Toolbar controls={null}>
  <StateVisualizer state={service} />
</Toolbar>

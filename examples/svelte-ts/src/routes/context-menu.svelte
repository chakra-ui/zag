<script lang="ts">
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as menu from "@zag-js/menu"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"
  import { unstate } from "svelte"

  const machine = useMachine(
    menu.machine({
      id: "1",
      onSelect: console.log,
    }),
  )

  const api = $derived(menu.connect(unstate(machine.state), machine.send, normalizeProps))
</script>

<main class="context-menu">
  <div {...api.contextTriggerProps}>Right Click here</div>
  <div use:portal {...api.positionerProps}>
    <ul {...api.contentProps}>
      <li {...api.getItemProps({ id: "edit" })}>Edit</li>
      <li {...api.getItemProps({ id: "duplicate" })}>Duplicate</li>
      <li {...api.getItemProps({ id: "delete" })}>Delete</li>
      <li {...api.getItemProps({ id: "export" })}>Export...</li>
    </ul>
  </div>
</main>

<Toolbar state={machine.state} />

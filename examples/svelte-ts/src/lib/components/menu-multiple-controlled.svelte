<script lang="ts">
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Portal from "./portal.svelte"

  let open = $state(false)

  const id = $props.id()
  const service = useMachine(menu.machine, () => ({
    id,
    onOpenChange: (details) => (open = details.open),
    open,
  }))

  const api = $derived(menu.connect(service, normalizeProps))
</script>

<button {...api.getTriggerProps()}>Click me</button>
<Portal>
  <div {...api.getPositionerProps()}>
    <div {...api.getContentProps()}>
      <li {...api.getItemProps({ value: "edit" })}>Edit</li>
      <li {...api.getItemProps({ value: "duplicate" })}>Duplicate</li>
      <li {...api.getItemProps({ value: "delete" })}>Delete</li>
      <li {...api.getItemProps({ value: "export" })}>Export...</li>
    </div>
  </div>
</Portal>

<script lang="ts">
  import Portal from "$lib/components/portal.svelte"
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/menu.css"

  const items = [
    { label: "Edit", value: "edit" },
    { label: "Duplicate", value: "duplicate" },
    { label: "Delete", value: "delete" },
    { label: "Export...", value: "export" },
  ]

  let open = $state(false)

  const id = $props.id()
  const service = useMachine(menu.machine, () => ({
    id,
    open,
    onOpenChange: (details) => (open = details.open),
  }))

  const api = $derived(menu.connect(service, normalizeProps))
</script>

<div style="padding: 40px; height: 200vh">
  <h1>Menu Controlled</h1>
  <h1>{String(open)}</h1>

  <div style="display: flex; gap: 12px; margin-bottom: 24px">
    <button type="button" onclick={() => (open = true)}>Open</button>
    <button type="button" onclick={() => (open = false)}>Close</button>
  </div>

  <button type="button" {...api.getTriggerProps()}>Menu Trigger</button>
  <Portal>
    <div {...api.getPositionerProps()}>
      <ul {...api.getContentProps()}>
        {#each items as item (item.value)}
          <li {...api.getItemProps({ value: item.value })}>
            {item.label}
          </li>
        {/each}
      </ul>
    </div>
  </Portal>
</div>

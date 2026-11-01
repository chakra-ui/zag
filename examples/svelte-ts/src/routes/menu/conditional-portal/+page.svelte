<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  let log = $state<string[]>([])

  const id = $props.id()
  const service = useMachine(menu.machine, {
    id,
    onSelect: ({ value }) => (log = [...log, `select:${value}`]),
    onOpenChange: ({ open }) => (log = [...log, `open:${open}`]),
  })

  const api = $derived(menu.connect(service, normalizeProps))
</script>

<main>
  <div data-testid="open-state">{String(api.open)}</div>
  <div data-testid="log">{log.join(",")}</div>
  <button {...api.getTriggerProps()}>
    Actions <span {...api.getIndicatorProps()}>▾</span>
  </button>
  <!-- Content stays mounted while closed and is re-parented into the portal when open -->
  <div hidden={!api.open}>
    <Portal disabled={!api.open}>
      <div {...api.getPositionerProps()}>
        <ul {...api.getContentProps()}>
          <li {...api.getItemProps({ value: "edit" })}>Edit</li>
          <li {...api.getItemProps({ value: "duplicate" })}>Duplicate</li>
          <li {...api.getItemProps({ value: "delete" })}>Delete</li>
        </ul>
      </div>
    </Portal>
  </div>
</main>

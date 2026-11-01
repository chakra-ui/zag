<script lang="ts">
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const id = $props.id()
  const service = useMachine(menu.machine, {
    id,
    positioning: { hideWhenDetached: true },
  })

  const api = $derived(menu.connect(service, normalizeProps))
</script>

<div>
  <button {...api.getTriggerProps()}>
    Actions <span {...api.getIndicatorProps()}>▾</span>
  </button>
  {#if api.open}
    <div {...api.getPositionerProps()}>
      <ul {...api.getContentProps()}>
        <li {...api.getItemProps({ value: "edit" })}>Edit</li>
        <li {...api.getItemProps({ value: "duplicate" })}>Duplicate</li>
        <li {...api.getItemProps({ value: "delete" })}>Delete</li>
        <li {...api.getItemProps({ value: "export" })}>Export...</li>
      </ul>
    </div>
  {/if}
</div>

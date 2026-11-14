<script lang="ts">
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import * as menu from "@zag-js/menu"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/menu.css"

  const id = $props.id()
  const service = useMachine(menu.machine, { id, onSelect: console.log })
  const api = $derived(menu.connect(service, normalizeProps))
</script>

<main>
  <label>
    Search <input placeholder="Keep typing while the menu opens" />
  </label>
  <div
    role="presentation"
    onpointerenter={() => api.setOpen(true, "trigger-hover")}
    onpointerleave={() => api.setOpen(false, "trigger-hover")}
  >
    <button {...api.getTriggerProps()}>
      Actions <span {...api.getIndicatorProps()}>▾</span>
    </button>
    <div {...api.getPositionerProps()}>
      <ul {...api.getContentProps()}>
        <li {...api.getItemProps({ value: "edit" })}>Edit</li>
        <li {...api.getItemProps({ value: "duplicate" })}>Duplicate</li>
        <li {...api.getItemProps({ value: "delete" })}>Delete</li>
      </ul>
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>

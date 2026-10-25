<script lang="ts">
  import Presence from "$lib/components/presence.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as menu from "@zag-js/menu"
  import { menuControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const controls = useControls(menuControls)

  const id = $props.id()
  const service = useMachine(
    menu.machine,
    controls.mergeProps<menu.Props>({
      id,
      onSelect: console.log,
    }),
  )

  const api = $derived(menu.connect(service, normalizeProps))
</script>

<main>
  <div>
    <button {...api.getTriggerProps()}>
      Actions <span {...api.getIndicatorProps()}>▾</span>
    </button>
    <Presence hidden={!api.open} lazyMount unmountOnExit>
      <div {...api.getPositionerProps()}>
        <ul {...api.getContentProps()}>
          <li {...api.getItemProps({ value: "edit" })}>Edit</li>
          <li {...api.getItemProps({ value: "duplicate" })}>Duplicate</li>
          <li {...api.getItemProps({ value: "delete" })}>Delete</li>
          <li {...api.getItemProps({ value: "export" })}>Export...</li>
        </ul>
      </div>
    </Presence>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>

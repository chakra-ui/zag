<script lang="ts">
  import styles from "../../../../../../shared/src/css/menu.module.css"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { useControls } from "$lib/use-controls.svelte"
  import * as menu from "@zag-js/menu"
  import { menuControls } from "@zag-js/shared"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"

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
    <div use:portal {...api.getPositionerProps()}>
      <ul {...api.getContentProps()} class={styles.Content}>
        <li {...api.getItemProps({ value: "edit" })} class={styles.Item}>Edit</li>
        <li {...api.getItemProps({ value: "duplicate" })} class={styles.Item}>Duplicate</li>
        <li {...api.getItemProps({ value: "delete" })} class={styles.Item}>Delete</li>
        <li {...api.getItemProps({ value: "export" })} class={styles.Item}>Export...</li>
      </ul>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>

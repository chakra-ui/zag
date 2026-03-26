<script lang="ts">
  import styles from "../../../../../../shared/src/css/menu.module.css"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as menu from "@zag-js/menu"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"

  const id = $props.id()
  const service = useMachine(menu.machine, {
    id,
    onSelect: console.log,
  })

  const api = $derived(menu.connect(service, normalizeProps))
</script>

<main class="context-menu">
  <div {...api.getContextTriggerProps()} class={styles.ContextTrigger}>Right Click here</div>
  <div use:portal {...api.getPositionerProps()}>
    <ul {...api.getContentProps()} class={styles.Content}>
      <li {...api.getItemProps({ value: "edit" })} class={styles.Item}>Edit</li>
      <li {...api.getItemProps({ value: "duplicate" })} class={styles.Item}>Duplicate</li>
      <li {...api.getItemProps({ value: "delete" })} class={styles.Item}>Delete</li>
      <li {...api.getItemProps({ value: "export" })} class={styles.Item}>Export...</li>
    </ul>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>

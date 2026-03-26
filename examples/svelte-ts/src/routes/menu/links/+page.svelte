<script lang="ts">
  import styles from "../../../../../../shared/src/css/menu.module.css"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as menu from "@zag-js/menu"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"

  const id = $props.id()
  const service = useMachine(menu.machine, { id })
  const api = $derived(menu.connect(service, normalizeProps))
</script>

<main>
  <div>
    <p>Use a screen reader to navigate to the menu.</p>
    <button {...api.getTriggerProps()}>
      Actions <span {...api.getIndicatorProps()}>▾</span>
    </button>
    <div use:portal {...api.getPositionerProps()}>
      <div {...api.getContentProps()} class={styles.Content}>
        <a {...api.getItemProps({ value: "edit" })} class={styles.Item} href="https://google.com"> Google </a>
        <a {...api.getItemProps({ value: "duplicate" })} class={styles.Item} href="https://bing.com"> Bing </a>
        <a {...api.getItemProps({ value: "delete" })} class={styles.Item} href="https://github.com" target="_blank"> GitHub </a>
        <a {...api.getItemProps({ value: "export" })} class={styles.Item} href="https://youtube.com" target="_blank"> YouTube </a>
      </div>
    </div>
  </div>
</main>

<Toolbar controls={null}>
  <StateVisualizer state={service} />
</Toolbar>

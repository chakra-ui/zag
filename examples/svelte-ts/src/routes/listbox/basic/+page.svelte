<script lang="ts">
  import styles from "../../../../../../shared/src/css/listbox.module.css"
  import * as listbox from "@zag-js/listbox"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { listboxControls, selectData } from "@zag-js/shared"
  import { useControls } from "$lib/use-controls.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"

  interface Item {
    label: string
    value: string
  }

  const controls = useControls(listboxControls)
  const collection = listbox.collection({ items: selectData })

  const id = $props.id()
  const service = useMachine(
    listbox.machine,
    controls.mergeProps<listbox.Props<Item>>({
      id,
      collection,
    }),
  )

  const api = $derived(listbox.connect(service, normalizeProps))
</script>

<main class="listbox">
  <div {...api.getRootProps()}>
    <label {...api.getLabelProps()} class={styles.Label}>Label</label>
    <ul {...api.getContentProps()} class={styles.Content}>
      {#each selectData as item}
        <li {...api.getItemProps({ item })} class={styles.Item}>
          <span {...api.getItemTextProps({ item })} class={styles.ItemText}>{item.label}</span>
          <span {...api.getItemIndicatorProps({ item })}>✓</span>
        </li>
      {/each}
    </ul>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>

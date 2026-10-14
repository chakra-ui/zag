<script lang="ts">
  import * as listbox from "@zag-js/listbox"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { listboxControls, selectData } from "@zag-js/shared"
  import { useControls } from "$lib/use-controls.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import "@styles/listbox.css"

  interface Item {
    label: string
    value: string
  }

  const controls = useControls(listboxControls)

  const collection = listbox.gridCollection({
    items: selectData,
    columnCount: 3,
  })

  const id = $props.id()
  const service = useMachine(
    listbox.machine,
    controls.mergeProps<listbox.Props<Item>>({
      collection,
      id,
    }),
  )

  const api = $derived(listbox.connect(service, normalizeProps))
</script>

<main class="listbox">
  <div {...api.getRootProps()}>
    <label {...api.getLabelProps()}>Label</label>
    <div {...api.getContentProps()}>
      <ul {...api.getListProps()}>
        {#each collection.items as item (item.value)}
          <li {...api.getItemProps({ item })}>
            {item.label}
            <span {...api.getItemIndicatorProps({ item })}>✓</span>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</main>

<Toolbar {controls} viz>
  <StateVisualizer state={service} context={["highlightedValue"]} />
</Toolbar>

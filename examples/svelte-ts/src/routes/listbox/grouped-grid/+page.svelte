<script lang="ts">
  import * as listbox from "@zag-js/listbox"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { groupedData, listboxControls } from "@zag-js/shared"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import "@styles/listbox.css"

  type Item = (typeof groupedData)[number]

  const collection = listbox.gridCollection({
    items: groupedData,
    columnCount: 2,
    groupBy: (item) => item.type,
  })

  const controls = useControls(listboxControls)

  const id = $props.id()
  const service = useMachine(
    listbox.machine as listbox.Machine<Item>,
    controls.mergeProps<listbox.Props<Item>>({
      id,
      collection,
    }),
  )

  const api = $derived(listbox.connect(service, normalizeProps))
</script>

<main class="listbox">
  <div {...api.getRootProps()}>
    <label {...api.getLabelProps()}>Label</label>
    <div {...api.getContentProps()}>
      <div {...api.getListProps()}>
        <!-- `display: contents` keeps items on the content's grid -->
        {#each collection.group() as [type, items] (type)}
          <div {...api.getItemGroupProps({ id: type })} style="display: contents">
            <div {...api.getItemGroupLabelProps({ htmlFor: type })} style="grid-column: 1 / -1">{type}</div>
            {#each items as item (item.value)}
              <div {...api.getItemProps({ item })}>
                <span {...api.getItemTextProps({ item })}>{item.label}</span>
              </div>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  </div>
</main>

<Toolbar {controls} viz>
  <StateVisualizer state={service} context={["highlightedValue"]} />
</Toolbar>

<script lang="ts">
  import * as listbox from "@zag-js/listbox"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { listboxControls, listboxData, type ListboxOption } from "@zag-js/shared"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import "@styles/listbox.css"

  const collection = listbox.collection({
    items: listboxData.timezones,
    groupBy: (item) => item.group ?? "",
  })

  const controls = useControls(listboxControls)

  const id = $props.id()
  const service = useMachine(
    listbox.machine,
    controls.mergeProps<listbox.Props<ListboxOption>>({
      id,
      collection,
      defaultValue: ["Europe/London"],
    }),
  )

  const api = $derived(listbox.connect(service, normalizeProps))
</script>

<main class="listbox">
  <div {...api.getRootProps()}>
    <label {...api.getLabelProps()}>Timezone</label>
    <div {...api.getContentProps()}>
      <div {...api.getListProps()}>
        {#each collection.group() as [group, items] (group)}
          <div {...api.getItemGroupProps({ id: group })}>
            <div {...api.getItemGroupLabelProps({ htmlFor: group })}>{group}</div>
            {#each items as item (item.value)}
              <div {...api.getItemProps({ item, highlightOnHover: true })}>
                <span {...api.getItemTextProps({ item })}>{item.label}</span>
                <span class="listbox-item-description">{item.description}</span>
                <span {...api.getItemIndicatorProps({ item })}>✓</span>
              </div>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} context={["value", "highlightedValue"]} />
</Toolbar>

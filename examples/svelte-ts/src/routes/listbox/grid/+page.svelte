<script lang="ts">
  import * as listbox from "@zag-js/listbox"
  import { Check } from "lucide-svelte"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { listboxControls, listboxData, type ListboxOption } from "@zag-js/shared"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import "@styles/listbox.css"

  const collection = listbox.gridCollection({
    items: listboxData.photos,
    columnCount: 3,
  })

  const controls = useControls(listboxControls)

  const id = $props.id()
  const service = useMachine(
    listbox.machine,
    controls.mergeProps<listbox.Props<ListboxOption>>({
      id,
      collection,
      defaultValue: ["photo-43"],
    }),
  )

  const api = $derived(listbox.connect(service, normalizeProps))
</script>

<main class="listbox listbox-photos">
  <div {...api.getRootProps()}>
    <label {...api.getLabelProps()}>Cover photo</label>
    <div {...api.getContentProps()}>
      <ul {...api.getListProps()}>
        {#each collection.items as item (item.value)}
          <li {...api.getItemProps({ item, highlightOnHover: true })}>
            <img src={item.src} alt="" loading="lazy" />
            <span {...api.getItemTextProps({ item })}>{item.label}</span>
            <span {...api.getItemIndicatorProps({ item })}><Check strokeWidth={3} /></span>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</main>

<Toolbar {controls} viz>
  <StateVisualizer state={service} context={["value", "highlightedValue"]} />
</Toolbar>

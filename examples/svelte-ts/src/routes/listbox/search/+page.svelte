<script lang="ts">
  import { createFilter } from "@zag-js/i18n-utils"
  import * as listbox from "@zag-js/listbox"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import { listboxControls, selectData } from "@zag-js/shared"
  import { useControls } from "$lib/use-controls.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import "@styles/listbox.css"

  interface Item {
    label: string
    value: string
  }

  const filter = createFilter({ sensitivity: "base" })

  let search = $state("")

  const collection = $derived.by(() => {
    const items = selectData.filter((item) => filter.startsWith(item.label, search))
    return listbox.collection({ items })
  })

  const controls = useControls(listboxControls)

  const id = $props.id()
  const service = useMachine(
    listbox.machine as listbox.Machine<Item>,
    controls.mergeProps<listbox.Props<Item>>(() => ({
      collection,
      id,
      typeahead: false,
    })),
  )

  const api = $derived(listbox.connect(service, normalizeProps))
</script>

<main class="listbox">
  <div {...api.getRootProps()}>
    <label {...api.getLabelProps()}>Country</label>
    <div {...api.getContentProps()}>
      <input
        {...mergeProps(api.getInputProps({ autoHighlight: true }), {
          oninput: (e: Event) => (search = (e.currentTarget as HTMLInputElement).value),
        })}
        aria-label="Filter countries"
        placeholder="Filter…"
        value={search}
      />
      <div {...api.getEmptyProps()}>{collection.size === 0 ? `No matches for "${search}"` : ""}</div>
      <ul {...api.getListProps()}>
        {#each collection.items as item (item.value)}
          <li {...api.getItemProps({ item })}>
            <span {...api.getItemTextProps({ item })}>{item.label}</span>
            <span {...api.getItemIndicatorProps({ item })}>✓</span>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</main>

<Toolbar {controls} viz>
  <StateVisualizer state={service} context={["highlightedValue", "focused"]} />
</Toolbar>

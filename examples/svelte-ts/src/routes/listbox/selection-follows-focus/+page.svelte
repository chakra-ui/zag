<script lang="ts">
  import * as listbox from "@zag-js/listbox"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { listboxData, type ListboxOption } from "@zag-js/shared"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import "@styles/listbox.css"

  const collection = listbox.collection({ items: listboxData.calendarViews })

  const id = $props.id()
  const service = useMachine(listbox.machine as listbox.Machine<ListboxOption>, {
    id,
    collection,
    defaultValue: ["week"],
    orientation: "horizontal",
    selectionMode: "single",
    deselectable: false,
    // arrow keys select as they move
    selectOnHighlight: true,
  })

  const api = $derived(listbox.connect(service, normalizeProps))
</script>

<main class="listbox listbox-segmented">
  <div class="listbox-stack">
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Calendar view</label>
      <div {...api.getContentProps()}>
        <ul {...api.getListProps()}>
          {#each listboxData.calendarViews as item (item.value)}
            <li {...api.getItemProps({ item })}>
              <span {...api.getItemTextProps({ item })}>{item.label}</span>
            </li>
          {/each}
        </ul>
      </div>
    </div>
    <div class="listbox-preview" data-testid="preview">Showing the {api.valueAsString.toLowerCase()} view</div>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} context={["value", "highlightedValue"]} />
</Toolbar>

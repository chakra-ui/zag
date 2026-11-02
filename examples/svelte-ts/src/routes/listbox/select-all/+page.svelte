<script lang="ts">
  import * as listbox from "@zag-js/listbox"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { listboxData, type ListboxOption } from "@zag-js/shared"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import "@styles/listbox.css"

  const collection = listbox.collection({ items: listboxData.notifications })

  const id = $props.id()
  const service = useMachine(listbox.machine as listbox.Machine<ListboxOption>, {
    id,
    collection,
    defaultValue: ["comments", "mentions"],
    selectionMode: "multiple",
  })

  const api = $derived(listbox.connect(service, normalizeProps))
  const allSelected = $derived(api.value.length === collection.size)
</script>

<main class="listbox">
  <div {...api.getRootProps()}>
    <label {...api.getLabelProps()}>Email notifications</label>
    <div {...api.getContentProps()}>
      <div class="listbox-header">
        <span data-testid="value-text">{api.value.length} of {collection.size} selected</span>
        <div>
          <button type="button" disabled={allSelected} onclick={() => api.selectAll()}>Select all</button>
          <button type="button" disabled={api.value.length === 0} onclick={() => api.clearValue()}>Clear</button>
        </div>
      </div>
      <ul {...api.getListProps()}>
        {#each listboxData.notifications as item (item.value)}
          <li {...api.getItemProps({ item, highlightOnHover: true })}>
            <div class="listbox-item-body">
              <span {...api.getItemTextProps({ item })}>{item.label}</span>
              <span class="listbox-item-description">{item.description}</span>
            </div>
            <span {...api.getItemIndicatorProps({ item })}>✓</span>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={service} context={["value", "highlightedValue"]} />
</Toolbar>

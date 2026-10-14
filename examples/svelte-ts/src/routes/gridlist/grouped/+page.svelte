<script lang="ts">
  import * as gridlist from "@zag-js/gridlist"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { gridListGroupedData } from "@zag-js/shared"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import "@styles/gridlist.css"

  interface Bookmark {
    id: string
    name: string
    url: string
    category: string
  }

  const collection = gridlist.collection<Bookmark>({
    items: gridListGroupedData,
    itemToValue: (item) => item.id,
    itemToString: (item) => item.name,
    groupBy: (item) => item.category,
  })

  const id = $props.id()
  const service = useMachine(gridlist.machine as gridlist.Machine<Bookmark>, {
    id,
    collection,
    selectionMode: "single",
    selectionBehavior: "replace",
  })

  const api = $derived(gridlist.connect(service, normalizeProps))
</script>

<main>
  <div class="gridlist">
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Bookmarks</label>
      <div {...api.getContentProps()}>
        {#each api.collection.group() as [groupKey, items] (groupKey)}
          <div {...api.getItemGroupProps({ id: groupKey })}>
            <div {...api.getItemGroupLabelProps({ htmlFor: groupKey })}>{groupKey}</div>
            {#each items as item (item.id)}
              <div {...api.getItemProps({ item, focusOnHover: true })}>
                <div {...api.getCellProps()}>
                  <div class="gridlist-item-body">
                    <span {...api.getItemTextProps({ item })} class="gridlist-item-title">
                      {item.name}
                    </span>
                    <span class="gridlist-item-description">{item.url}</span>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/each}
        <div {...api.getEmptyProps()}>No bookmarks</div>
      </div>
    </div>

    <p style="margin-top: 12px; font-size: 13px; color: #52525b">
      Selected: <strong>{api.valueAsString || "none"}</strong>
    </p>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} context={["focusedValue", "value"]} />
</Toolbar>

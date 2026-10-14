<script lang="ts">
  import * as gridlist from "@zag-js/gridlist"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { gridListGridData } from "@zag-js/shared"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import "@styles/gridlist.css"

  interface Fruit {
    id: string
    name: string
    icon: string
  }

  const COLUMN_COUNT = 4

  const collection = gridlist.gridCollection<Fruit>({
    items: gridListGridData,
    columnCount: COLUMN_COUNT,
    itemToValue: (item) => item.id,
    itemToString: (item) => item.name,
  })

  const id = $props.id()
  const service = useMachine(gridlist.machine as gridlist.Machine<Fruit>, {
    id,
    collection,
    selectionMode: "multiple",
    selectionBehavior: "replace",
  })

  const api = $derived(gridlist.connect(service, normalizeProps))
</script>

<main>
  <div class="gridlist">
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Pick some fruit</label>
      <div {...api.getContentProps()}>
        {#each gridListGridData as item (item.id)}
          <div {...api.getItemProps({ item, focusOnHover: true })}>
            <div {...api.getCellProps()}>
              <span class="gridlist-tile-icon">{item.icon}</span>
              <span {...api.getItemTextProps({ item })} class="gridlist-tile-label">
                {item.name}
              </span>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <p style="margin-top: 12px; font-size: 13px; color: #52525b">
      Selected: <strong>{api.valueAsString || "none"}</strong>
    </p>
    <p style="font-size: 12px; color: #71717a">
      Arrow keys navigate between cells; hold Shift to extend; Cmd/Ctrl-click to toggle.
    </p>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} context={["focusedValue", "value"]} />
</Toolbar>

<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import * as dnd from "@zag-js/dnd"
  import * as gridlist from "@zag-js/gridlist"
  import styles from "@styles/dnd-gridlist.module.css"
  import { GripVerticalIcon } from "lucide-svelte"
  import { gridListData } from "@zag-js/shared"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/gridlist.css"

  interface Mailbox {
    id: string
    name: string
    description: string
    badge: string
  }

  const id = $props.id()
  let items = $state<Mailbox[]>(gridListData)
  const itemMap = $derived(new Map(items.map((i) => [i.id, i])))

  const collection = $derived(
    gridlist.collection<Mailbox>({
      items,
      itemToValue: (item) => item.id,
      itemToString: (item) => item.name,
    }),
  )

  const gridService = useMachine(gridlist.machine as gridlist.Machine<Mailbox>, (): gridlist.Props => ({
    id,
    collection,
    selectionMode: "multiple",
    selectionBehavior: "toggle",
  }))
  const gridApi = $derived(gridlist.connect(gridService, normalizeProps))

  const dndService = useMachine(dnd.machine, (): dnd.Props => ({
    id: `${id}-dnd`,
    orientation: "vertical",
    getValueText: (value) => itemMap.get(value)?.name ?? value,
    onDrop(details) {
      items = dnd.reorder(items, { ...details, itemToValue: (i) => i.id })
    },
  }))
  const dndApi = $derived(dnd.connect(dndService, normalizeProps))
</script>

<main>
  <div class="gridlist">
    <div {...gridApi.getRootProps()}>
      <label {...gridApi.getLabelProps()}>Sortable Mailboxes</label>
      <div {...mergeProps(gridApi.getContentProps(), dndApi.getRootProps())} class={styles.root}>
        {#each items as item (item.id)}
          <div
            {...mergeProps(gridApi.getItemProps({ item }), dndApi.getDropTargetProps({ value: item.id }), {
              class: `${styles.item} ${styles.dropTarget}`,
            })}
          >
            <div
              {...dndApi.getDropIndicatorProps({ value: item.id, placement: "before" })}
              class={styles.dropIndicator}
            ></div>
            <div {...gridApi.getCellProps()}>
              <span {...dndApi.getDragHandleProps({ value: item.id })} class={styles.dragHandle}>
                <GripVerticalIcon size={14} />
              </span>
              <div class="gridlist-item-body">
                <span {...gridApi.getItemTextProps({ item })} class="gridlist-item-title">{item.name}</span>
                <span class="gridlist-item-description">{item.description}</span>
              </div>
              <span class="gridlist-item-badge">{item.badge}</span>
            </div>
            <div
              {...dndApi.getDropIndicatorProps({ value: item.id, placement: "after" })}
              class={styles.dropIndicator}
            ></div>
          </div>
        {/each}
        <div {...gridApi.getEmptyProps()}>No items</div>
      </div>
    </div>
    <p class={styles.selectionSummary}>
      Selected:
      <strong>{gridApi.valueAsString || "none"}</strong>
    </p>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={dndService} />
</Toolbar>

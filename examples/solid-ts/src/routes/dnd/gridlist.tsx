import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as gridlist from "@zag-js/gridlist"
import * as dnd from "@zag-js/dnd"
import { gridListData } from "@zag-js/shared"
import { GripVertical } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import styles from "@styles/dnd-gridlist.module.css"
import "@styles/gridlist.css"

interface Mailbox {
  id: string
  name: string
  description: string
  badge: string
}

export default function Page() {
  const [items, setItems] = createSignal<Mailbox[]>(gridListData)
  const itemMap = createMemo(() => new Map(items().map((i) => [i.id, i])))

  const collection = createMemo(() =>
    gridlist.collection<Mailbox>({
      items: items(),
      itemToValue: (item) => item.id,
      itemToString: (item) => item.name,
    }),
  )

  const gridId = createUniqueId()
  const gridService = useMachine(gridlist.machine as gridlist.Machine<Mailbox>, () => ({
    id: gridId,
    collection: collection(),
    selectionMode: "multiple" as const,
    selectionBehavior: "toggle" as const,
  }))
  const gridApi = createMemo(() => gridlist.connect(gridService, normalizeProps))

  const dndService = useMachine(dnd.machine, {
    id: createUniqueId(),
    orientation: "vertical",
    getValueText: (value) => itemMap().get(value)?.name ?? value,
    onDrop(details) {
      setItems((prev) => dnd.reorder(prev, { ...details, itemToValue: (i) => i.id }))
    },
  })
  const dndApi = createMemo(() => dnd.connect(dndService, normalizeProps))

  return (
    <>
      <main>
        <div class="gridlist">
          <div {...gridApi().getRootProps()}>
            <label {...gridApi().getLabelProps()}>Sortable Mailboxes</label>
            <div {...mergeProps(gridApi().getContentProps(), dndApi().getRootProps(), { class: styles.root })}>
              <For each={items()}>
                {(item) => (
                  <div
                    {...mergeProps(gridApi().getItemProps({ item }), dndApi().getDropTargetProps({ value: item.id }), {
                      class: `${styles.item} ${styles.dropTarget}`,
                    })}
                  >
                    <div
                      {...dndApi().getDropIndicatorProps({ value: item.id, placement: "before" })}
                      class={styles.dropIndicator}
                    />

                    <div {...gridApi().getCellProps()}>
                      <span {...dndApi().getDragHandleProps({ value: item.id })} class={styles.dragHandle}>
                        <GripVertical size={14} />
                      </span>
                      <div class="gridlist-item-body">
                        <span {...gridApi().getItemTextProps({ item })} class="gridlist-item-title">
                          {item.name}
                        </span>
                        <span class="gridlist-item-description">{item.description}</span>
                      </div>
                      <span class="gridlist-item-badge">{item.badge}</span>
                    </div>

                    <div
                      {...dndApi().getDropIndicatorProps({ value: item.id, placement: "after" })}
                      class={styles.dropIndicator}
                    />
                  </div>
                )}
              </For>
              <div {...gridApi().getEmptyProps()}>No items</div>
            </div>
          </div>

          <p class={styles.selectionSummary}>
            Selected: <strong>{gridApi().valueAsString || "none"}</strong>
          </p>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={dndService} />
      </Toolbar>
    </>
  )
}

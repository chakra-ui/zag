import { ListCollection } from "@zag-js/collection"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as dnd from "@zag-js/dnd"
import { GripVertical } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, For, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import styles from "@styles/dnd-list.module.css"

const ROOT = "inbox"

type Item = { id: string; name: string }

function createList(items: Item[]) {
  return new ListCollection({
    items,
    itemToValue: (item) => item.id,
    itemToString: (item) => item.name,
  })
}

const sourceData: Item[] = [
  { id: "beedrill", name: "Beedrill" },
  { id: "pidgeot", name: "Pidgeot" },
  { id: "fearow", name: "Fearow" },
  { id: "jigglypuff", name: "Jigglypuff" },
]

export default function Page() {
  const [source, setSource] = createSignal(createList(sourceData))
  const [inbox, setInbox] = createSignal(createList([]))

  const service = useMachine(dnd.machine, {
    id: createUniqueId(),
    orientation: "vertical",
    dropPlacements: ["before", "after", "on"],
    getValueText: (value) =>
      value === ROOT ? "Inbox" : (source().stringify(value) ?? inbox().stringify(value) ?? value),
    canDrag: (value) => source().has(value),
    canDrop: (dragSource, target, placement) => {
      if (!source().has(dragSource)) return false
      if (target === ROOT) return placement === "on"
      return inbox().has(target) && placement !== "on"
    },
    onDrop({ values, target, placement }) {
      const moved = source().findMany(values)
      if (!moved.length) return
      setSource((list) => list.remove(...values))
      setInbox((list) => {
        if (target === ROOT) return list.append(...moved)
        return placement === "after" ? list.insertAfter(target, ...moved) : list.insertBefore(target, ...moved)
      })
    },
  })

  const api = createMemo(() => dnd.connect(service, normalizeProps))

  return (
    <>
      <main class={`${styles.main} ${styles.wide}`}>
        <div {...api().getRootProps()} class={styles.root}>
          <h3>Drop on the collection</h3>
          <p class={styles.helperText}>
            Spectrum's root drop: hover the empty inbox to drop on the list as a whole, or insert between items once it
            has rows.
          </p>
          <div class={styles.transferLayout}>
            <div class={styles.transferColumn}>
              <h4>Available</h4>
              <ul class={styles.transferList}>
                <For each={source().items}>
                  {(item) => (
                    <li class={styles.item}>
                      <div {...mergeProps(api().getDraggableProps({ value: item.id }), { class: styles.draggable })}>
                        <span {...api().getDragHandleProps({ value: item.id })} class={styles.dragHandle}>
                          <GripVertical size={14} />
                        </span>
                        {item.name}
                      </div>
                    </li>
                  )}
                </For>
              </ul>
            </div>
            <div class={styles.transferColumn}>
              <h4>Inbox</h4>
              <div {...mergeProps(api().getDropTargetProps({ value: ROOT }), { class: styles.rootDrop })}>
                <Show
                  when={!inbox().size}
                  fallback={
                    <ul class={styles.transferList}>
                      <For each={inbox().items}>
                        {(item) => (
                          <li class={styles.item}>
                            <div
                              {...api().getDropIndicatorProps({ value: item.id, placement: "before" })}
                              class={styles.dropIndicator}
                            />
                            <div
                              {...mergeProps(api().getDropTargetProps({ value: item.id }), {
                                class: `${styles.draggable} ${styles.dropTarget}`,
                              })}
                            >
                              {item.name}
                            </div>
                            <div
                              {...api().getDropIndicatorProps({ value: item.id, placement: "after" })}
                              class={styles.dropIndicator}
                            />
                          </li>
                        )}
                      </For>
                    </ul>
                  }
                >
                  <p class={styles.rootDropEmpty}>Drop onto the list</p>
                </Show>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

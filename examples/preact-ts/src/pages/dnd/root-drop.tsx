import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { ListCollection } from "@zag-js/collection"
import * as dnd from "@zag-js/dnd"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/preact"
import styles from "@styles/dnd-list.module.css"
import { GripVerticalIcon } from "lucide-preact"
import { useId, useState } from "react"

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

const ROOT = "inbox"

export default function Page() {
  const [source, setSource] = useState(() => createList(sourceData))
  const [inbox, setInbox] = useState(() => createList([]))

  const service = useMachine(dnd.machine, {
    id: useId(),
    orientation: "vertical",
    dropPlacements: ["before", "after", "on"],
    getValueText: (value) => (value === ROOT ? "Inbox" : (source.stringify(value) ?? inbox.stringify(value) ?? value)),
    canDrag: (value) => source.has(value),
    canDrop: (dragSource, target, placement) => {
      if (!source.has(dragSource)) return false
      if (target === ROOT) return placement === "on"
      return inbox.has(target) && placement !== "on"
    },
    onDrop({ values, target, placement }) {
      const moved = source.findMany(values)
      if (moved.length === 0) return
      setSource((list) => list.remove(...values))
      setInbox((list) => {
        if (target === ROOT) return list.append(...moved)
        return placement === "after" ? list.insertAfter(target, ...moved) : list.insertBefore(target, ...moved)
      })
    },
  })
  const api = dnd.connect(service, normalizeProps)

  return (
    <>
      <main className={`${styles.main} ${styles.wide}`}>
        <div {...api.getRootProps()} className={styles.root}>
          <h3>Drop on the collection</h3>
          <p className={styles.helperText}>
            Spectrum&apos;s root drop: hover the empty inbox to drop on the list as a whole, or insert between items
            once it has rows.
          </p>
          <div className={styles.transferLayout}>
            <div className={styles.transferColumn}>
              <h4>Available</h4>
              <ul className={styles.transferList}>
                {source.items.map((item) => (
                  <li key={item.id} className={styles.item}>
                    <div {...mergeProps(api.getDraggableProps({ value: item.id }), { className: styles.draggable })}>
                      <span {...api.getDragHandleProps({ value: item.id })} className={styles.dragHandle}>
                        <GripVerticalIcon size={14} />
                      </span>
                      {item.name}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.transferColumn}>
              <h4>Inbox</h4>
              <div {...mergeProps(api.getDropTargetProps({ value: ROOT }), { className: styles.rootDrop })}>
                {inbox.size === 0 ? (
                  <p className={styles.rootDropEmpty}>Drop onto the list</p>
                ) : (
                  <ul className={styles.transferList}>
                    {inbox.items.map((item) => (
                      <li key={item.id} className={styles.item}>
                        <div
                          {...api.getDropIndicatorProps({ value: item.id, placement: "before" })}
                          className={styles.dropIndicator}
                        />
                        <div
                          {...mergeProps(api.getDropTargetProps({ value: item.id }), {
                            className: `${styles.draggable} ${styles.dropTarget}`,
                          })}
                        >
                          {item.name}
                        </div>
                        <div
                          {...api.getDropIndicatorProps({ value: item.id, placement: "after" })}
                          className={styles.dropIndicator}
                        />
                      </li>
                    ))}
                  </ul>
                )}
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

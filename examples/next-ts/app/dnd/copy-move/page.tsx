"use client"

import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { ListCollection } from "@zag-js/collection"
import * as dnd from "@zag-js/dnd"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import styles from "@styles/dnd-list.module.css"
import { GripVerticalIcon } from "lucide-react"
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
  { id: "photoshop", name: "Adobe Photoshop" },
  { id: "xd", name: "Adobe XD" },
  { id: "dreamweaver", name: "Adobe Dreamweaver" },
  { id: "indesign", name: "Adobe InDesign" },
]

const COPY = "library"
const MOVE = "archive"

export default function Page() {
  const [source, setSource] = useState(() => createList(sourceData))
  const [library, setLibrary] = useState(() => createList([]))
  const [archive, setArchive] = useState(() => createList([]))

  const service = useMachine(dnd.machine, {
    id: useId(),
    orientation: "vertical",
    dropPlacements: ["on"],
    getValueText: (value) => {
      if (value === COPY) return "Library"
      if (value === MOVE) return "Archive"
      return source.stringify(value) ?? value
    },
    canDrag: (value) => source.has(value),
    canDrop: (dragSource, target) => source.has(dragSource) && (target === COPY || target === MOVE),
    onDrop({ values, target }) {
      const moved = source.findMany(values)
      if (moved.length === 0) return

      if (target === COPY) {
        setLibrary((list) =>
          list.append(...moved.map((item) => ({ id: `${item.id}-${crypto.randomUUID()}`, name: item.name }))),
        )
        return
      }

      setSource((list) => list.remove(...values))
      setArchive((list) => list.append(...moved))
    },
  })
  const api = dnd.connect(service, normalizeProps)

  const renderZone = (value: string, title: string, list: ListCollection<Item>) => (
    <div className={styles.transferColumn}>
      <h4>{title}</h4>
      <div {...mergeProps(api.getDropTargetProps({ value }), { className: styles.rootDrop })}>
        {list.size === 0 ? (
          <p className={styles.rootDropEmpty}>Drop here</p>
        ) : (
          <ul className={styles.transferList}>
            {list.items.map((item) => (
              <li key={item.id} className={styles.item}>
                <div className={styles.draggable}>{item.name}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )

  return (
    <>
      <main className={`${styles.main} ${styles.wide}`}>
        <div {...api.getRootProps()} className={styles.root}>
          <h3>Copy vs move</h3>
          <p className={styles.helperText}>
            Spectrum drop operations without HTML5 DataTransfer: Library copies, Archive moves. Zag reports the target;
            the app chooses the operation.
          </p>
          <div className={styles.transferLayout}>
            <div className={styles.transferColumn}>
              <h4>Source</h4>
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
            {renderZone(COPY, "Library (copy)", library)}
            {renderZone(MOVE, "Archive (move)", archive)}
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

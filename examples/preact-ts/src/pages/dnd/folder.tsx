import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { ListCollection } from "@zag-js/collection"
import * as dnd from "@zag-js/dnd"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/preact"
import styles from "@styles/dnd-list.module.css"
import { FolderIcon, GripVerticalIcon } from "lucide-preact"
import { useId, useState } from "react"

type FileItem = { id: string; kind: "file"; name: string }
type FolderItem = { id: string; kind: "folder"; name: string; children: FileItem[] }
type Item = FileItem | FolderItem

function createList<T extends { id: string; name: string }>(items: T[]) {
  return new ListCollection({
    items,
    itemToValue: (item) => item.id,
    itemToString: (item) => item.name,
  })
}

const sourceData: FileItem[] = [
  { id: "photoshop", kind: "file", name: "Adobe Photoshop" },
  { id: "xd", kind: "file", name: "Adobe XD" },
  { id: "dreamweaver", kind: "file", name: "Adobe Dreamweaver" },
  { id: "indesign", kind: "file", name: "Adobe InDesign" },
  { id: "connect", kind: "file", name: "Adobe Connect" },
]

const destData: Item[] = [
  { id: "aftereffects", kind: "file", name: "Adobe After Effects" },
  { id: "illustrator", kind: "file", name: "Adobe Illustrator" },
  { id: "lightroom", kind: "file", name: "Adobe Lightroom" },
  { id: "premiere", kind: "file", name: "Adobe Premiere Pro" },
  { id: "fresco", kind: "file", name: "Adobe Fresco" },
  { id: "apps", kind: "folder", name: "Apps", children: [] },
]

export default function Page() {
  const [source, setSource] = useState(() => createList(sourceData))
  const [dest, setDest] = useState(() => createList(destData))

  const service = useMachine(dnd.machine, {
    id: useId(),
    orientation: "vertical",
    dropPlacements: ["before", "after", "on"],
    getValueText: (value) => source.stringify(value) ?? dest.stringify(value) ?? value,
    canDrag: (value) => source.has(value),
    canDrop: (dragSource, target, placement) => {
      if (!source.has(dragSource)) return false
      if (placement === "on") return dest.find(target)?.kind === "folder"
      return dest.has(target)
    },
    onDrop({ values, target, placement }) {
      const moved = source.findMany(values)
      if (moved.length === 0) return

      setSource((list) => list.remove(...values))

      if (placement === "on") {
        setDest((list) => {
          const folder = list.find(target)
          if (folder?.kind !== "folder") return list
          return list.update(target, { ...folder, children: [...folder.children, ...moved] })
        })
        return
      }

      setDest((list) =>
        placement === "after" ? list.insertAfter(target, ...moved) : list.insertBefore(target, ...moved),
      )
    },
  })
  const api = dnd.connect(service, normalizeProps)

  const renderSourceItem = (item: FileItem) => (
    <li key={item.id} className={styles.item}>
      <div
        {...mergeProps(api.getDraggableProps({ value: item.id }), {
          className: styles.draggable,
        })}
      >
        <span {...api.getDragHandleProps({ value: item.id })} className={styles.dragHandle}>
          <GripVerticalIcon size={14} />
        </span>
        {item.name}
      </div>
    </li>
  )

  const renderDestItem = (item: Item) => (
    <li key={item.id} className={styles.item}>
      <div {...api.getDropIndicatorProps({ value: item.id, placement: "before" })} className={styles.dropIndicator} />
      <div
        {...mergeProps(api.getDropTargetProps({ value: item.id }), {
          className: `${styles.draggable} ${styles.dropTarget}`,
        })}
      >
        {item.kind === "folder" ? <FolderIcon size={16} /> : null}
        {item.name}
        {item.kind === "folder" ? <span className={styles.folderMeta}>{item.children.length} item(s)</span> : null}
      </div>
      {item.kind === "folder" && item.children.length > 0 ? (
        <ul className={styles.folderChildren}>
          {item.children.map((child) => (
            <li key={child.id}>{child.name}</li>
          ))}
        </ul>
      ) : null}
      <div {...api.getDropIndicatorProps({ value: item.id, placement: "after" })} className={styles.dropIndicator} />
    </li>
  )

  return (
    <>
      <main className={`${styles.main} ${styles.wide}`}>
        <div {...api.getRootProps()} className={styles.root}>
          <h3>Insert between items, or drop on a folder</h3>
          <p className={styles.helperText}>
            Mirrors the Spectrum droppable-list example: move from the source list, insert between rows, or drop onto
            Apps.
          </p>
          <div className={styles.transferLayout}>
            <div className={styles.transferColumn}>
              <h4>Source</h4>
              <ul className={styles.transferList}>{source.items.map(renderSourceItem)}</ul>
            </div>
            <div className={styles.transferColumn}>
              <h4>Library</h4>
              <ul className={styles.transferList}>{dest.items.map(renderDestItem)}</ul>
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

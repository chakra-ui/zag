import { ListCollection } from "@zag-js/collection"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as dnd from "@zag-js/dnd"
import { Folder, GripVertical } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, For, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import styles from "@styles/dnd-list.module.css"

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
  const [source, setSource] = createSignal(createList(sourceData))
  const [dest, setDest] = createSignal(createList(destData))

  const service = useMachine(dnd.machine, {
    id: createUniqueId(),
    orientation: "vertical",
    dropPlacements: ["before", "after", "on"],
    getValueText: (value) => source().stringify(value) ?? dest().stringify(value) ?? value,
    canDrag: (value) => source().has(value),
    canDrop: (dragSource, target, placement) => {
      if (!source().has(dragSource)) return false
      if (placement === "on") return dest().find(target)?.kind === "folder"
      return dest().has(target)
    },
    onDrop({ values, target, placement }) {
      const moved = source().findMany(values)
      if (!moved.length) return
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

  const api = createMemo(() => dnd.connect(service, normalizeProps))

  return (
    <>
      <main class={`${styles.main} ${styles.wide}`}>
        <div {...api().getRootProps()} class={styles.root}>
          <h3>Insert between items, or drop on a folder</h3>
          <p class={styles.helperText}>
            Mirrors the Spectrum droppable-list example: move from the source list, insert between rows, or drop onto
            Apps.
          </p>
          <div class={styles.transferLayout}>
            <div class={styles.transferColumn}>
              <h4>Source</h4>
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
              <h4>Library</h4>
              <ul class={styles.transferList}>
                <For each={dest().items}>
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
                        <Show when={item.kind === "folder"}>
                          <Folder size={16} />
                        </Show>
                        {item.name}
                        <Show when={item.kind === "folder"}>
                          <span class={styles.folderMeta}>{(item as FolderItem).children.length} item(s)</span>
                        </Show>
                      </div>
                      <Show when={item.kind === "folder" && (item as FolderItem).children.length}>
                        <ul class={styles.folderChildren}>
                          <For each={(item as FolderItem).children}>{(child) => <li>{child.name}</li>}</For>
                        </ul>
                      </Show>
                      <div
                        {...api().getDropIndicatorProps({ value: item.id, placement: "after" })}
                        class={styles.dropIndicator}
                      />
                    </li>
                  )}
                </For>
              </ul>
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

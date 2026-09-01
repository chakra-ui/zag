import { ListCollection } from "@zag-js/collection"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as dnd from "@zag-js/dnd"
import { GripVertical } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, For, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import styles from "@styles/dnd-list.module.css"

const COPY = "library"
const MOVE = "archive"

type Item = { id: string; name: string }

function createList(items: Item[]) {
  return new ListCollection({
    items,
    itemToValue: (item) => item.id,
    itemToString: (item) => item.name,
  })
}

export default function Page() {
  const [source, setSource] = createSignal(
    createList([
      { id: "photoshop", name: "Adobe Photoshop" },
      { id: "xd", name: "Adobe XD" },
      { id: "dreamweaver", name: "Adobe Dreamweaver" },
      { id: "indesign", name: "Adobe InDesign" },
    ]),
  )
  const [library, setLibrary] = createSignal(createList([]))
  const [archive, setArchive] = createSignal(createList([]))

  const service = useMachine(dnd.machine, {
    id: createUniqueId(),
    orientation: "vertical",
    dropPlacements: ["on"],
    getValueText: (value) => {
      if (value === COPY) return "Library"
      if (value === MOVE) return "Archive"
      return source().stringify(value) ?? value
    },
    canDrag: (value) => source().has(value),
    canDrop: (dragSource, target) => source().has(dragSource) && (target === COPY || target === MOVE),
    onDrop({ values, target }) {
      const moved = source().findMany(values)
      if (!moved.length) return
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

  const api = createMemo(() => dnd.connect(service, normalizeProps))

  const renderZone = (value: string, title: string, list: () => ListCollection<Item>) => (
    <div class={styles.transferColumn}>
      <h4>{title}</h4>
      <div {...mergeProps(api().getDropTargetProps({ value }), { class: styles.rootDrop })}>
        <Show
          when={!list().size}
          fallback={
            <ul class={styles.transferList}>
              <For each={list().items}>
                {(item) => (
                  <li class={styles.item}>
                    <div class={styles.draggable}>{item.name}</div>
                  </li>
                )}
              </For>
            </ul>
          }
        >
          <p class={styles.rootDropEmpty}>Drop here</p>
        </Show>
      </div>
    </div>
  )

  return (
    <>
      <main class={`${styles.main} ${styles.wide}`}>
        <div {...api().getRootProps()} class={styles.root}>
          <h3>Copy vs move</h3>
          <p class={styles.helperText}>
            Library copies. Archive moves. Zag reports the target; the app chooses the operation.
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

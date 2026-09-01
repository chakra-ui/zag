<script lang="ts">
  import { ListCollection } from "@zag-js/collection"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import * as dnd from "@zag-js/dnd"
  import { Folder, GripVertical } from "lucide-svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
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

  const id = $props.id()
  let source = $state(
    createList<FileItem>([
      { id: "photoshop", kind: "file", name: "Adobe Photoshop" },
      { id: "xd", kind: "file", name: "Adobe XD" },
      { id: "dreamweaver", kind: "file", name: "Adobe Dreamweaver" },
      { id: "indesign", kind: "file", name: "Adobe InDesign" },
      { id: "connect", kind: "file", name: "Adobe Connect" },
    ]),
  )
  let dest = $state(
    createList<Item>([
      { id: "aftereffects", kind: "file", name: "Adobe After Effects" },
      { id: "illustrator", kind: "file", name: "Adobe Illustrator" },
      { id: "lightroom", kind: "file", name: "Adobe Lightroom" },
      { id: "premiere", kind: "file", name: "Adobe Premiere Pro" },
      { id: "fresco", kind: "file", name: "Adobe Fresco" },
      { id: "apps", kind: "folder", name: "Apps", children: [] },
    ]),
  )

  const service = useMachine(dnd.machine, {
    id,
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
      if (!moved.length) return
      source = source.remove(...values)
      if (placement === "on") {
        const folder = dest.find(target)
        if (folder?.kind !== "folder") return
        dest = dest.update(target, { ...folder, children: [...folder.children, ...moved] })
        return
      }
      dest = placement === "after" ? dest.insertAfter(target, ...moved) : dest.insertBefore(target, ...moved)
    },
  })

  const api = $derived(dnd.connect(service, normalizeProps))
</script>

<main class="{styles.main} {styles.wide}">
  <div {...api.getRootProps()} class={styles.root}>
    <h3>Insert between items, or drop on a folder</h3>
    <p class={styles.helperText}>
      Mirrors the Spectrum droppable-list example: move from the source list, insert between rows, or drop onto Apps.
    </p>
    <div class={styles.transferLayout}>
      <div class={styles.transferColumn}>
        <h4>Source</h4>
        <ul class={styles.transferList}>
          {#each source.items as item (item.id)}
            <li class={styles.item}>
              <div {...mergeProps(api.getDraggableProps({ value: item.id }), { class: styles.draggable })}>
                <span {...api.getDragHandleProps({ value: item.id })} class={styles.dragHandle}>
                  <GripVertical size={14} />
                </span>
                {item.name}
              </div>
            </li>
          {/each}
        </ul>
      </div>
      <div class={styles.transferColumn}>
        <h4>Library</h4>
        <ul class={styles.transferList}>
          {#each dest.items as item (item.id)}
            <li class={styles.item}>
              <div
                {...api.getDropIndicatorProps({ value: item.id, placement: "before" })}
                class={styles.dropIndicator}
              ></div>
              <div
                {...mergeProps(api.getDropTargetProps({ value: item.id }), {
                  class: `${styles.draggable} ${styles.dropTarget}`,
                })}
              >
                {#if item.kind === "folder"}
                  <Folder size={16} />
                {/if}
                {item.name}
                {#if item.kind === "folder"}
                  <span class={styles.folderMeta}>{item.children.length} item(s)</span>
                {/if}
              </div>
              {#if item.kind === "folder" && item.children.length}
                <ul class={styles.folderChildren}>
                  {#each item.children as child (child.id)}
                    <li>{child.name}</li>
                  {/each}
                </ul>
              {/if}
              <div
                {...api.getDropIndicatorProps({ value: item.id, placement: "after" })}
                class={styles.dropIndicator}
              ></div>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>

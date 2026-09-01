<script lang="ts" setup>
import { ListCollection } from "@zag-js/collection"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import * as dnd from "@zag-js/dnd"
import { Folder, GripVertical } from "lucide-vue-next"
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

const source = ref(
  createList<FileItem>([
    { id: "photoshop", kind: "file", name: "Adobe Photoshop" },
    { id: "xd", kind: "file", name: "Adobe XD" },
    { id: "dreamweaver", kind: "file", name: "Adobe Dreamweaver" },
    { id: "indesign", kind: "file", name: "Adobe InDesign" },
    { id: "connect", kind: "file", name: "Adobe Connect" },
  ]),
)

const dest = ref(
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
  id: useId(),
  orientation: "vertical",
  dropPlacements: ["before", "after", "on"],
  getValueText: (value) => source.value.stringify(value) ?? dest.value.stringify(value) ?? value,
  canDrag: (value) => source.value.has(value),
  canDrop: (dragSource, target, placement) => {
    if (!source.value.has(dragSource)) return false
    if (placement === "on") return dest.value.find(target)?.kind === "folder"
    return dest.value.has(target)
  },
  onDrop({ values, target, placement }) {
    const moved = source.value.findMany(values)
    if (moved.length === 0) return
    source.value = source.value.remove(...values)
    if (placement === "on") {
      const folder = dest.value.find(target)
      if (folder?.kind !== "folder") return
      dest.value = dest.value.update(target, { ...folder, children: [...folder.children, ...moved] })
      return
    }
    dest.value =
      placement === "after" ? dest.value.insertAfter(target, ...moved) : dest.value.insertBefore(target, ...moved)
  },
})

const api = computed(() => dnd.connect(service, normalizeProps))
</script>

<template>
  <main :class="[styles.main, styles.wide]">
    <div v-bind="api.getRootProps()" :class="styles.root">
      <h3>Insert between items, or drop on a folder</h3>
      <p :class="styles.helperText">
        Mirrors the Spectrum droppable-list example: move from the source list, insert between rows, or drop onto Apps.
      </p>
      <div :class="styles.transferLayout">
        <div :class="styles.transferColumn">
          <h4>Source</h4>
          <ul :class="styles.transferList">
            <li v-for="item in source.items" :key="item.id" :class="styles.item">
              <div v-bind="mergeProps(api.getDraggableProps({ value: item.id }), { class: styles.draggable })">
                <span v-bind="api.getDragHandleProps({ value: item.id })" :class="styles.dragHandle">
                  <GripVertical :size="14" />
                </span>
                {{ item.name }}
              </div>
            </li>
          </ul>
        </div>
        <div :class="styles.transferColumn">
          <h4>Library</h4>
          <ul :class="styles.transferList">
            <li v-for="item in dest.items" :key="item.id" :class="styles.item">
              <div
                v-bind="api.getDropIndicatorProps({ value: item.id, placement: 'before' })"
                :class="styles.dropIndicator"
              />
              <div
                v-bind="
                  mergeProps(api.getDropTargetProps({ value: item.id }), {
                    class: `${styles.draggable} ${styles.dropTarget}`,
                  })
                "
              >
                <Folder v-if="item.kind === 'folder'" :size="16" />
                {{ item.name }}
                <span v-if="item.kind === 'folder'" :class="styles.folderMeta">{{ item.children.length }} item(s)</span>
              </div>
              <ul v-if="item.kind === 'folder' && item.children.length" :class="styles.folderChildren">
                <li v-for="child in item.children" :key="child.id">{{ child.name }}</li>
              </ul>
              <div
                v-bind="api.getDropIndicatorProps({ value: item.id, placement: 'after' })"
                :class="styles.dropIndicator"
              />
            </li>
          </ul>
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

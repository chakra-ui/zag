<script lang="ts" setup>
import { ListCollection } from "@zag-js/collection"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import * as dnd from "@zag-js/dnd"
import { GripVertical } from "lucide-vue-next"
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

const source = ref(
  createList([
    { id: "photoshop", name: "Adobe Photoshop" },
    { id: "xd", name: "Adobe XD" },
    { id: "dreamweaver", name: "Adobe Dreamweaver" },
    { id: "indesign", name: "Adobe InDesign" },
  ]),
)
const library = ref(createList([]))
const archive = ref(createList([]))

const service = useMachine(dnd.machine, {
  id: useId(),
  orientation: "vertical",
  dropPlacements: ["on"],
  getValueText: (value) => {
    if (value === COPY) return "Library"
    if (value === MOVE) return "Archive"
    return source.value.stringify(value) ?? value
  },
  canDrag: (value) => source.value.has(value),
  canDrop: (dragSource, target) => source.value.has(dragSource) && (target === COPY || target === MOVE),
  onDrop({ values, target }) {
    const moved = source.value.findMany(values)
    if (!moved.length) return
    if (target === COPY) {
      library.value = library.value.append(
        ...moved.map((item) => ({ id: `${item.id}-${crypto.randomUUID()}`, name: item.name })),
      )
      return
    }
    source.value = source.value.remove(...values)
    archive.value = archive.value.append(...moved)
  },
})

const api = computed(() => dnd.connect(service, normalizeProps))
</script>

<template>
  <main :class="[styles.main, styles.wide]">
    <div v-bind="api.getRootProps()" :class="styles.root">
      <h3>Copy vs move</h3>
      <p :class="styles.helperText">
        Library copies. Archive moves. Zag reports the target; the app chooses the operation.
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
          <h4>Library (copy)</h4>
          <div v-bind="mergeProps(api.getDropTargetProps({ value: COPY }), { class: styles.rootDrop })">
            <p v-if="!library.size" :class="styles.rootDropEmpty">Drop here</p>
            <ul v-else :class="styles.transferList">
              <li v-for="item in library.items" :key="item.id" :class="styles.item">
                <div :class="styles.draggable">{{ item.name }}</div>
              </li>
            </ul>
          </div>
        </div>
        <div :class="styles.transferColumn">
          <h4>Archive (move)</h4>
          <div v-bind="mergeProps(api.getDropTargetProps({ value: MOVE }), { class: styles.rootDrop })">
            <p v-if="!archive.size" :class="styles.rootDropEmpty">Drop here</p>
            <ul v-else :class="styles.transferList">
              <li v-for="item in archive.items" :key="item.id" :class="styles.item">
                <div :class="styles.draggable">{{ item.name }}</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

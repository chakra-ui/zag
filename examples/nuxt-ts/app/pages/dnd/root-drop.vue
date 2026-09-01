<script lang="ts" setup>
import { ListCollection } from "@zag-js/collection"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import * as dnd from "@zag-js/dnd"
import { GripVertical } from "lucide-vue-next"
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

const source = ref(
  createList([
    { id: "beedrill", name: "Beedrill" },
    { id: "pidgeot", name: "Pidgeot" },
    { id: "fearow", name: "Fearow" },
    { id: "jigglypuff", name: "Jigglypuff" },
  ]),
)
const inbox = ref(createList([]))

const service = useMachine(dnd.machine, {
  id: useId(),
  orientation: "vertical",
  dropPlacements: ["before", "after", "on"],
  getValueText: (value) =>
    value === ROOT ? "Inbox" : (source.value.stringify(value) ?? inbox.value.stringify(value) ?? value),
  canDrag: (value) => source.value.has(value),
  canDrop: (dragSource, target, placement) => {
    if (!source.value.has(dragSource)) return false
    if (target === ROOT) return placement === "on"
    return inbox.value.has(target) && placement !== "on"
  },
  onDrop({ values, target, placement }) {
    const moved = source.value.findMany(values)
    if (!moved.length) return
    source.value = source.value.remove(...values)
    if (target === ROOT) {
      inbox.value = inbox.value.append(...moved)
      return
    }
    inbox.value =
      placement === "after" ? inbox.value.insertAfter(target, ...moved) : inbox.value.insertBefore(target, ...moved)
  },
})

const api = computed(() => dnd.connect(service, normalizeProps))
</script>

<template>
  <main :class="[styles.main, styles.wide]">
    <div v-bind="api.getRootProps()" :class="styles.root">
      <h3>Drop on the collection</h3>
      <p :class="styles.helperText">
        Spectrum's root drop: hover the empty inbox to drop on the list as a whole, or insert between items once it has
        rows.
      </p>
      <div :class="styles.transferLayout">
        <div :class="styles.transferColumn">
          <h4>Available</h4>
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
          <h4>Inbox</h4>
          <div v-bind="mergeProps(api.getDropTargetProps({ value: ROOT }), { class: styles.rootDrop })">
            <p v-if="!inbox.size" :class="styles.rootDropEmpty">Drop onto the list</p>
            <ul v-else :class="styles.transferList">
              <li v-for="item in inbox.items" :key="item.id" :class="styles.item">
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
                  {{ item.name }}
                </div>
                <div
                  v-bind="api.getDropIndicatorProps({ value: item.id, placement: 'after' })"
                  :class="styles.dropIndicator"
                />
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

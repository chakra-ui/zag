<script lang="ts" setup>
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import * as gridlist from "@zag-js/gridlist"
import * as dnd from "@zag-js/dnd"
import { gridListData } from "@zag-js/shared"
import { GripVertical } from "lucide-vue-next"
import styles from "@styles/dnd-gridlist.module.css"
import "@styles/gridlist.css"

interface Mailbox {
  id: string
  name: string
  description: string
  badge: string
}

const items = ref<Mailbox[]>(gridListData)
const itemMap = computed(() => new Map(items.value.map((i) => [i.id, i])))

const collection = computed(() =>
  gridlist.collection<Mailbox>({
    items: items.value,
    itemToValue: (item) => item.id,
    itemToString: (item) => item.name,
  }),
)

const gridId = useId()
const gridService = useMachine(
  gridlist.machine as gridlist.Machine<Mailbox>,
  computed(() => ({
    id: gridId,
    collection: collection.value,
    selectionMode: "multiple" as const,
    selectionBehavior: "toggle" as const,
  })),
)
const gridApi = computed(() => gridlist.connect(gridService, normalizeProps))

const dndService = useMachine(dnd.machine, {
  id: useId(),
  orientation: "vertical",
  getValueText: (value) => itemMap.value.get(value)?.name ?? value,
  onDrop(details) {
    items.value = dnd.reorder(items.value, { ...details, itemToValue: (i) => i.id })
  },
})
const dndApi = computed(() => dnd.connect(dndService, normalizeProps))
</script>

<template>
  <main>
    <div class="gridlist">
      <div v-bind="gridApi.getRootProps()">
        <label v-bind="gridApi.getLabelProps()">Sortable Mailboxes</label>
        <div v-bind="mergeProps(gridApi.getContentProps(), dndApi.getRootProps())" :class="styles.root">
          <div
            v-for="item in items"
            :key="item.id"
            v-bind="
              mergeProps(gridApi.getItemProps({ item }), dndApi.getDropTargetProps({ value: item.id }), {
                class: `${styles.item} ${styles.dropTarget}`,
              })
            "
          >
            <div
              v-bind="dndApi.getDropIndicatorProps({ value: item.id, placement: 'before' })"
              :class="styles.dropIndicator"
            />

            <div v-bind="gridApi.getCellProps()">
              <span v-bind="dndApi.getDragHandleProps({ value: item.id })" :class="styles.dragHandle">
                <GripVertical :size="14" />
              </span>
              <div class="gridlist-item-body">
                <span v-bind="gridApi.getItemTextProps({ item })" class="gridlist-item-title">{{ item.name }}</span>
                <span class="gridlist-item-description">{{ item.description }}</span>
              </div>
              <span class="gridlist-item-badge">{{ item.badge }}</span>
            </div>

            <div
              v-bind="dndApi.getDropIndicatorProps({ value: item.id, placement: 'after' })"
              :class="styles.dropIndicator"
            />
          </div>
          <div v-bind="gridApi.getEmptyProps()">No items</div>
        </div>
      </div>

      <p :class="styles.selectionSummary">
        Selected: <strong>{{ gridApi.valueAsString || "none" }}</strong>
      </p>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="dndService" />
  </Toolbar>
</template>

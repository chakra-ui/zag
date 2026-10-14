<script setup lang="ts">
import * as gridlist from "@zag-js/gridlist"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { gridListGridData } from "@zag-js/shared"
import "@styles/gridlist.css"

interface Fruit {
  id: string
  name: string
  icon: string
}

const COLUMN_COUNT = 4

const collection = gridlist.gridCollection<Fruit>({
  items: gridListGridData,
  columnCount: COLUMN_COUNT,
  itemToValue: (item) => item.id,
  itemToString: (item) => item.name,
})

const service = useMachine(gridlist.machine as gridlist.Machine<Fruit>, {
  id: useId(),
  collection,
  selectionMode: "multiple",
  selectionBehavior: "replace",
})

const api = computed(() => gridlist.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div class="gridlist">
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Pick some fruit</label>
        <div v-bind="api.getContentProps()">
          <div v-for="item in gridListGridData" :key="item.id" v-bind="api.getItemProps({ item, focusOnHover: true })">
            <div v-bind="api.getCellProps()">
              <span class="gridlist-tile-icon">{{ item.icon }}</span>
              <span v-bind="api.getItemTextProps({ item })" class="gridlist-tile-label">{{ item.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <p style="margin-top: 12px; font-size: 13px; color: #52525b">
        Selected: <strong>{{ api.valueAsString || "none" }}</strong>
      </p>
      <p style="font-size: 12px; color: #71717a">
        Arrow keys navigate between cells; hold Shift to extend; Cmd/Ctrl-click to toggle.
      </p>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :context="['focusedValue', 'value']" />
  </Toolbar>
</template>

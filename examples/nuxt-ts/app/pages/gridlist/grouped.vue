<script setup lang="ts">
import * as gridlist from "@zag-js/gridlist"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { gridListGroupedData } from "@zag-js/shared"
import "@styles/gridlist.css"

interface Bookmark {
  id: string
  name: string
  url: string
  category: string
}

const collection = gridlist.collection<Bookmark>({
  items: gridListGroupedData,
  itemToValue: (item) => item.id,
  itemToString: (item) => item.name,
  groupBy: (item) => item.category,
})

const service = useMachine(gridlist.machine as gridlist.Machine<Bookmark>, {
  id: useId(),
  collection,
  selectionMode: "single",
  selectionBehavior: "replace",
})

const api = computed(() => gridlist.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div class="gridlist">
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Bookmarks</label>
        <div v-bind="api.getContentProps()">
          <div
            v-for="[groupKey, items] in api.collection.group()"
            :key="groupKey"
            v-bind="api.getItemGroupProps({ id: groupKey })"
          >
            <div v-bind="api.getItemGroupLabelProps({ htmlFor: groupKey })">{{ groupKey }}</div>
            <div v-for="item in items" :key="item.id" v-bind="api.getItemProps({ item, focusOnHover: true })">
              <div v-bind="api.getCellProps()">
                <div class="gridlist-item-body">
                  <span v-bind="api.getItemTextProps({ item })" class="gridlist-item-title">{{ item.name }}</span>
                  <span class="gridlist-item-description">{{ item.url }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-bind="api.getEmptyProps()">No bookmarks</div>
        </div>
      </div>

      <p style="margin-top: 12px; font-size: 13px; color: #52525b">
        Selected: <strong>{{ api.valueAsString || "none" }}</strong>
      </p>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :context="['focusedValue', 'value']" />
  </Toolbar>
</template>

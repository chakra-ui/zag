<script setup lang="ts">
import * as listbox from "@zag-js/listbox"
import { listboxControls, listboxData, type ListboxOption } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/listbox.css"

const collection = listbox.collection({
  items: listboxData.timezones,
  groupBy: (item) => item.group ?? "",
})

const controls = useControls(listboxControls)

const service = useMachine(
  listbox.machine,
  controls.mergeProps<listbox.Props<ListboxOption>>({
    collection,
    id: useId(),
    defaultValue: ["Europe/London"],
  }),
)

const api = computed(() => listbox.connect(service, normalizeProps))
</script>

<template>
  <main class="listbox">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Timezone</label>
      <div v-bind="api.getContentProps()">
        <div v-bind="api.getListProps()">
          <div v-for="[group, items] in collection.group()" :key="group" v-bind="api.getItemGroupProps({ id: group })">
            <div v-bind="api.getItemGroupLabelProps({ htmlFor: group })">{{ group }}</div>
            <div v-for="item in items" :key="item.value" v-bind="api.getItemProps({ item, highlightOnHover: true })">
              <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
              <span class="listbox-item-description">{{ item.description }}</span>
              <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :context="['value', 'highlightedValue']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

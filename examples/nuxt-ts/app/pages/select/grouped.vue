<script setup lang="ts">
import * as select from "@zag-js/select"
import { groupedData, selectControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/select.css"

type Item = (typeof groupedData)[number]

const controls = useControls(selectControls)

const service = useMachine(
  select.machine as select.Machine<Item>,
  controls.mergeProps<select.Props<Item>>({
    collection: select.collection({ items: groupedData, groupBy: (item) => item.type }),
    id: useId(),
  }),
)

const api = computed(() => select.connect(service, normalizeProps))
</script>

<template>
  <main class="select">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Label</label>
      <div v-bind="api.getControlProps()">
        <button v-bind="api.getTriggerProps()">
          <span>{{ api.valueAsString || "Select option" }}</span>
          <span v-bind="api.getIndicatorProps()">▼</span>
        </button>
        <button v-bind="api.getClearTriggerProps()">X</button>
      </div>

      <Teleport to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <div v-bind="api.getContentProps()">
            <div v-bind="api.getListProps()">
              <div
                v-for="[type, items] in api.collection.group()"
                :key="type"
                v-bind="api.getItemGroupProps({ id: type })"
              >
                <div v-bind="api.getItemGroupLabelProps({ htmlFor: type })">{{ type }}</div>
                <div v-for="item in items" :key="item.value" v-bind="api.getItemProps({ item })">
                  <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
                  <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

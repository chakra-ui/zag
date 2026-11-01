<script setup lang="ts">
import * as select from "@zag-js/select"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronsUpDownIcon } from "lucide-vue-next"

const items = ["Apple", "Banana", "Cherry"]

const service = useMachine(select.machine, {
  id: useId(),
  collection: select.collection({ items }),
})
const api = computed(() => select.connect(service, normalizeProps))
</script>

<template>
  <div v-bind="api.getRootProps()">
    <label v-bind="api.getLabelProps()">Fruit</label>
    <button v-bind="api.getTriggerProps()" data-testid="select-trigger">
      <span>{{ api.valueAsString || "Select fruit" }}</span>
      <span v-bind="api.getIndicatorProps()">
        <ChevronsUpDownIcon />
      </span>
    </button>
    <Teleport to="#teleports">
      <Presence
        v-bind="api.getPositionerProps()"
        :hidden="!api.open"
        lazy-mount
        unmount-on-exit
        data-testid="select-positioner"
      >
        <div v-bind="api.getContentProps()" :hidden="false" data-testid="select-content">
          <div v-bind="api.getListProps()" data-testid="select-list">
            <div v-for="item in items" :key="item" v-bind="api.getItemProps({ item })">
              <span v-bind="api.getItemTextProps({ item })">{{ item }}</span>
            </div>
          </div>
        </div>
      </Presence>
    </Teleport>
  </div>
</template>

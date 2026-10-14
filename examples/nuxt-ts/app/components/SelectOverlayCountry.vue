<script setup lang="ts">
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronsUpDownIcon, XIcon } from "lucide-vue-next"

const service = useMachine(select.machine, {
  collection: select.collection({ items: selectData }),
  id: useId(),
  name: "country",
})
const api = computed(() => select.connect(service, normalizeProps))
</script>

<template>
  <div v-bind="api.getRootProps()">
    <label v-bind="api.getLabelProps()">Label</label>
    <div v-bind="api.getControlProps()">
      <button
        v-bind="
          mergeProps(api.getTriggerProps(), { 'aria-controls': !api.open ? (null as unknown as undefined) : undefined })
        "
      >
        <span>{{ api.valueAsString || "Select option" }}</span>
      </button>
      <div class="select-indicator-group">
        <button v-bind="api.getClearTriggerProps()">
          <XIcon />
        </button>
        <span v-bind="api.getIndicatorProps()">
          <ChevronsUpDownIcon />
        </span>
      </div>
    </div>
    <Teleport v-if="api.open" to="#teleports">
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <div v-bind="api.getListProps()">
            <div v-for="item in selectData" :key="item.value" v-bind="api.getItemProps({ item })">
              <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
              <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

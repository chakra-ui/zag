<script setup lang="ts">
import * as select from "@zag-js/select"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronsUpDownIcon } from "lucide-vue-next"

interface Item {
  label: string
  value: string
}

const props = defineProps<{ label: string; items: Item[]; defaultValue?: string | undefined }>()

const service = useMachine(select.machine as select.Machine<Item>, {
  collection: select.collection({ items: props.items }),
  id: useId(),
  defaultValue: props.defaultValue ? [props.defaultValue] : undefined,
  alignItemWithTrigger: true,
})

const api = computed(() => select.connect(service, normalizeProps))
</script>

<template>
  <div v-bind="api.getRootProps()">
    <label v-bind="api.getLabelProps()">{{ label }}</label>
    <div v-bind="api.getControlProps()">
      <button v-bind="api.getTriggerProps()">
        <span v-bind="api.getValueTextProps()">{{ api.valueAsString || "Select a fruit" }}</span>
        <span v-bind="api.getIndicatorProps()">
          <ChevronsUpDownIcon />
        </span>
      </button>
    </div>

    <Teleport v-if="api.open" to="#teleports">
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <div v-bind="api.getScrollArrowProps({ placement: 'top' })">▲</div>
          <div v-bind="api.getListProps()">
            <div v-for="item in items" :key="item.value" v-bind="api.getItemProps({ item })">
              <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
              <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
            </div>
          </div>
          <div v-bind="api.getScrollArrowProps({ placement: 'bottom' })">▼</div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronsUpDownIcon } from "lucide-vue-next"
import "@styles/select.css"

const collection = select.collection({
  items: selectData,
  itemToString: (item) => item.label,
  itemToValue: (item) => item.value,
})

const open = ref(false)
const value = ref<string | null>(null)

const id = useId()
const service = useMachine(
  select.machine,
  computed<select.Props>(() => ({
    id,
    collection,
    value: value.value ? [value.value] : undefined,
    open: open.value,
    onValueChange: (details) => {
      value.value = details.value[0] ?? null
    },
    onOpenChange: (details) => {
      open.value = details.open
    },
  })),
)

const api = computed(() => select.connect(service, normalizeProps))
</script>

<template>
  <div style="padding: 40px">
    <h1>{{ value || "-" }}</h1>

    <div style="display: flex; gap: 12px; margin-bottom: 24px">
      <button @click="value = selectData[0]!.value">Change to {{ selectData[0]!.label }}</button>
      <button @click="value = selectData[1]!.value">Change to {{ selectData[1]!.label }}</button>
    </div>

    <div v-bind="api.getRootProps()">
      <div v-bind="api.getControlProps()">
        <label v-bind="api.getLabelProps()">Label</label>
        <button v-bind="api.getTriggerProps()">
          <span>{{ api.valueAsString || "Select a country" }}</span>
          <span v-bind="api.getIndicatorProps()">
            <ChevronsUpDownIcon />
          </span>
        </button>
      </div>

      <Teleport to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <div v-bind="api.getContentProps()">
            <ul v-bind="api.getListProps()">
              <li v-for="item in selectData" :key="item.value" v-bind="api.getItemProps({ item })">
                <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
                <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
              </li>
            </ul>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

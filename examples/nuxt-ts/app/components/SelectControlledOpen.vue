<script setup lang="ts">
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronsUpDownIcon } from "lucide-vue-next"

const props = defineProps<{ id: string }>()

const open = ref(false)
const collection = select.collection({ items: selectData })

const service = useMachine(
  select.machine,
  computed<select.Props>(() => ({
    collection,
    id: props.id,
    name: "country",
    open: open.value,
    onOpenChange: (details) => {
      open.value = details.open
    },
  })),
)

const api = computed(() => select.connect(service, normalizeProps))
</script>

<template>
  <div v-bind="api.getRootProps()">
    <div v-bind="api.getControlProps()">
      <button v-bind="api.getTriggerProps()">
        <span>{{ api.valueAsString || "Select option" }}</span>
        <span v-bind="api.getIndicatorProps()">
          <ChevronsUpDownIcon />
        </span>
      </button>
    </div>
    <Teleport to="#teleports">
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

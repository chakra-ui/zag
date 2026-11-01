<script setup lang="ts">
import * as select from "@zag-js/select"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronsUpDownIcon, XIcon } from "lucide-vue-next"
import "@styles/select.css"

interface Item {
  label: string
  value: string
  disabled?: boolean
}

const service = useMachine(select.machine as select.Machine<Item>, {
  id: useId(),
  collection: select.collection<Item>({
    items: [
      { label: "Apple", value: "apple" },
      { label: "Banana", value: "banana" },
      { label: "Cherry", value: "cherry" },
      { label: "Coconut", value: "coconut" },
      { label: "Date", value: "date" },
      { label: "Duck", value: "duck", disabled: true },
      { label: "Elephant", value: "elephant" },
      { label: "Fish", value: "fish" },
      { label: "Giraffe", value: "giraffe" },
      { label: "Hippo", value: "hippo" },
      { label: "Igloo", value: "igloo" },
    ],
  }),
})

const api = computed(() => select.connect(service, normalizeProps))
</script>

<template>
  <main class="select">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Label</label>
      <div v-bind="api.getControlProps()">
        <button v-bind="api.getTriggerProps()">
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
      <Teleport to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <div v-bind="api.getContentProps()">
            <div v-bind="api.getListProps()">
              <div v-for="item in api.collection.items" :key="item.value" v-bind="api.getItemProps({ item })">
                <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
                <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </main>
</template>

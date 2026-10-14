<script setup lang="ts">
import * as select from "@zag-js/select"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronsUpDownIcon } from "lucide-vue-next"
import "@styles/select.css"

interface Item {
  label: string
  value: string
}

const items: Item[] = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Solid", value: "solid" },
]

const value = ["react"]

const collection = select.collection({
  items,
  itemToValue: (item) => item.value,
  itemToString: (item) => item.label,
})

const service = useMachine(select.machine as select.Machine<Item>, {
  id: useId(),
  collection,
  value,
})

const api = computed(() => select.connect(service, normalizeProps))
</script>

<template>
  <main class="select" style="padding: 2rem">
    <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 320px">
      <div style="font-size: 0.875rem"><strong>Value (controlled, fixed):</strong> {{ value.join(", ") }}</div>
      <div data-testid="selected-items" style="font-size: 0.875rem">
        <strong>Selected items (from api):</strong> {{ api.selectedItems.map((item) => item.label).join(", ") }}
      </div>

      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Select framework</label>
        <div v-bind="mergeProps(api.getControlProps(), { style: { display: 'flex', marginTop: '4px' } })">
          <button data-testid="trigger" v-bind="mergeProps(api.getTriggerProps(), { style: { flex: 1 } })">
            <span>{{ api.valueAsString || "Select option" }}</span>
            <span v-bind="api.getIndicatorProps()">
              <ChevronsUpDownIcon />
            </span>
          </button>
        </div>

        <Teleport to="#teleports">
          <div v-bind="api.getPositionerProps()">
            <div data-testid="select-content" v-bind="mergeProps(api.getContentProps(), { style: { padding: '4px' } })">
              <div v-bind="api.getListProps()">
                <div
                  v-for="item in items"
                  :key="item.value"
                  :data-testid="item.value"
                  v-bind="api.getItemProps({ item })"
                  style="padding: 8px 12px"
                >
                  <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
                  <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
                </div>
              </div>
            </div>
          </div>
        </Teleport>
      </div>
    </div>
  </main>
</template>

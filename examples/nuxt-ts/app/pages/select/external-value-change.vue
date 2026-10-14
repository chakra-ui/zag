<script setup lang="ts">
import * as select from "@zag-js/select"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronsUpDownIcon } from "lucide-vue-next"
import "@styles/select.css"

interface Item {
  label: string
  value: string
}

const frameworks: Item[] = [
  { label: "React", value: "react" },
  { label: "Solid", value: "solid" },
  { label: "Vue", value: "vue" },
]

const value = ref<string[]>(["react"])
const options = ref(frameworks)

const collection = computed(() =>
  select.collection({
    items: options.value,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
  }),
)

const id = useId()
const service = useMachine(
  select.machine as select.Machine<Item>,
  computed<select.Props<Item>>(() => ({
    id,
    collection: collection.value,
    value: value.value,
    onValueChange: (e) => {
      value.value = e.value
    },
  })),
)

const api = computed(() => select.connect(service, normalizeProps))

function setSolid() {
  options.value = frameworks
  value.value = ["solid"]
}
</script>

<template>
  <main class="select" style="padding: 2rem">
    <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 320px">
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
                  v-for="item in options"
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

      <button data-testid="filter-vue-button" @click="options = [frameworks[2]!]">Filter to Vue</button>
      <button data-testid="set-solid-button" @click="setSolid">Set value to Solid</button>
    </div>
  </main>
</template>

<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { menuControls, menuOptionData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/menu.css"

const controls = useControls(menuControls)
const service = useMachine(
  menu.machine,
  controls.mergeProps<menu.Props>({
    id: useId(),
  }),
)

const api = computed(() => menu.connect(service, normalizeProps))

const orderRef = ref("")
const typeRef = ref<string[]>([])

const radios = computed(() =>
  menuOptionData.order.map((item) => ({
    type: "radio" as const,
    name: "order",
    value: item.value,
    label: item.label,
    checked: item.value === orderRef.value,
    onCheckedChange(v: boolean) {
      orderRef.value = v ? item.value : ""
    },
  })),
)

const checkboxes = computed(() =>
  menuOptionData.type.map((item) => ({
    type: "checkbox" as const,
    name: "type",
    value: item.value,
    label: item.label,
    checked: typeRef.value.includes(item.value),
    onCheckedChange(v: boolean) {
      typeRef.value = v ? [...typeRef.value, item.value] : typeRef.value.filter((x) => x !== item.value)
    },
  })),
)
</script>

<template>
  <main>
    <div>
      <button data-testid="trigger" v-bind="api.getTriggerProps()">
        Actions <span v-bind="api.getIndicatorProps()">▾</span>
      </button>
      <Teleport to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <div v-bind="api.getContentProps()">
            <div v-for="item in radios" :key="item.value" v-bind="api.getOptionItemProps(item)">
              <span v-bind="api.getItemIndicatorProps(item)">✅</span>
              <span v-bind="api.getItemTextProps(item)">{{ item.label }}</span>
            </div>
            <hr />
            <div v-for="item in checkboxes" :key="item.value" v-bind="api.getOptionItemProps(item)">
              <span v-bind="api.getItemIndicatorProps(item)">✅</span>
              <span v-bind="api.getItemTextProps(item)">{{ item.label }}</span>
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

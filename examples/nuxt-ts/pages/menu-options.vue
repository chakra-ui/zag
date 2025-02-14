<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { menuControls, menuOptionData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(menuControls)
const service = useMachine(menu.machine, { id: useId() })

const api = computed(() => menu.connect(service, normalizeProps))

const orderRef = ref("")
const typeRef = ref<string[]>([])

const radios = computed(() =>
  menuOptionData.order.map((item) => ({
    label: item.label,
    id: item.value,
    type: "radio" as const,
    value: item.value,
    checked: item.value === orderRef.value,
    onCheckedChange(v: boolean) {
      orderRef.value = v ? item.value : ""
    },
  })),
)

const checkboxes = computed(() =>
  menuOptionData.type.map((item) => ({
    id: item.value,
    label: item.label,
    type: "checkbox" as const,
    value: item.value,
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
      <button v-bind="api.getTriggerProps()">Actions <span v-bind="api.getIndicatorProps()">▾</span></button>
      <Teleport to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <div v-bind="api.getContentProps()">
            <div v-for="item in radios" :key="item.value" v-bind="api.getOptionItemProps(item)">
              <span v-bind="api.getItemIndicatorProps(item)">✅</span>
              <span v-bind="api.getItemTextProps(item)">{{ item.label }}</span>
            </div>
            <hr v-bind="api.getSeparatorProps()" />
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

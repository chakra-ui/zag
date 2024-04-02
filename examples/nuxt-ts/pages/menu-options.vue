<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { menuControls, menuOptionData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(menuControls)
const [state, send] = useMachine(menu.machine({ id: "1" }))

const api = computed(() => menu.connect(state.value, send, normalizeProps))

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
      <button v-bind="api.triggerProps">Actions <span v-bind="api.indicatorProps">▾</span></button>
      <Teleport to="body">
        <div v-bind="api.positionerProps">
          <div v-bind="api.contentProps">
            <div v-for="item in radios" :key="item.value" v-bind="api.getOptionItemProps(item)">
              <span v-bind="api.getItemIndicatorProps(item)">✅</span>
              <span v-bind="api.getItemTextProps(item)">{{ item.label }}</span>
            </div>
            <hr v-bind="api.separatorProps" />
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
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { menuControls, menuOptionData as data } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(menuControls)
const [state, send] = useMachine(
  menu.machine({
    id: "1",
    value: { order: "", type: [] },
    onValueChange: console.log,
  }),
)

const api = computed(() => menu.connect(state.value, send, normalizeProps))

const radios = data.order.map((item) => ({
  ...item,
  type: "radio" as const,
  name: "order",
  value: item.id,
}))

const checkboxes = data.type.map((item) => ({
  ...item,
  type: "checkbox" as const,
  name: "type",
  value: item.id,
}))
</script>

<template>
  <main>
    <div>
      <button v-bind="api.triggerProps">Actions <span v-bind="api.indicatorProps">▾</span></button>
      <Teleport to="body">
        <div v-bind="api.positionerProps">
          <div v-bind="api.contentProps">
            <div v-for="item in radios" :key="item.id" v-bind="api.getOptionItemProps(item)">
              <span v-bind="api.getOptionItemIndicatorProps(item)">✅</span>
              <span v-bind="api.getOptionItemTextProps(item)">{{ item.label }}</span>
            </div>
            <hr />
            <div v-for="item in checkboxes" :key="item.id" v-bind="api.getOptionItemProps(item)">
              <span v-bind="api.getOptionItemIndicatorProps(item)">✅</span>
              <span v-bind="api.getOptionItemTextProps(item)">{{ item.label }}</span>
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

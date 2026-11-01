<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { menuData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/menu.css"

const service = useMachine(menu.machine, { id: useId() })
const root = computed(() => menu.connect(service, normalizeProps))

const subService = useMachine(menu.machine, { id: useId() })
const sub = computed(() => menu.connect(subService, normalizeProps))

const sub2Service = useMachine(menu.machine, { id: useId() })
const sub2 = computed(() => menu.connect(sub2Service, normalizeProps))

onMounted(() => {
  root.value.setChild(subService)
  sub.value.setParent(service)
  sub.value.setChild(sub2Service)
  sub2.value.setParent(subService)
})

const triggerItemProps = computed(() => root.value.getTriggerItemProps(sub.value))
const triggerItem2Props = computed(() => sub.value.getTriggerItemProps(sub2.value))

const [level1, level2, level3] = menuData
</script>

<template>
  <main>
    <div>
      <button data-testid="trigger" v-bind="root.getTriggerProps()">Click me</button>

      <Teleport to="#teleports">
        <div v-bind="root.getPositionerProps()">
          <ul data-testid="menu" v-bind="root.getContentProps()">
            <li
              v-for="item in level1"
              :key="item.value"
              :data-testid="item.value"
              v-bind="item.trigger ? triggerItemProps : root.getItemProps({ value: item.value })"
            >
              {{ item.label }}
            </li>
          </ul>
        </div>
      </Teleport>

      <Teleport to="#teleports">
        <div v-bind="sub.getPositionerProps()">
          <ul data-testid="more-tools-submenu" v-bind="sub.getContentProps()">
            <li
              v-for="item in level2"
              :key="item.value"
              :data-testid="item.value"
              v-bind="item.trigger ? triggerItem2Props : sub.getItemProps({ value: item.value })"
            >
              {{ item.label }}
            </li>
          </ul>
        </div>
      </Teleport>

      <Teleport to="#teleports">
        <div v-bind="sub2.getPositionerProps()">
          <ul data-testid="open-nested-submenu" v-bind="sub2.getContentProps()">
            <li
              v-for="item in level3"
              :key="item.value"
              :data-testid="item.value"
              v-bind="sub2.getItemProps({ value: item.value })"
            >
              {{ item.label }}
            </li>
          </ul>
        </div>
      </Teleport>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" label="Root Machine" />
    <StateVisualizer :state="subService" label="Sub Machine" />
    <StateVisualizer :state="sub2Service" label="Sub2 Machine" />
  </Toolbar>
</template>

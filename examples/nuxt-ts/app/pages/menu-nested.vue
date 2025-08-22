<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, onMounted, useId } from "vue"

const menuData = [
  [
    { label: "New File", value: "new-file" },
    { label: "New Tab", value: "new-tab" },
    { label: "New Window", value: "new-win" },
    { label: "More Tools →", value: "more-tools", trigger: true },
    { label: "Export", value: "export" },
    { label: "Go to Google...", value: "google" },
  ],
  [
    { label: "Save Page As...", value: "save-page" },
    { label: "Create Shortcuts", value: "shortcut" },
    { label: "Name Window...", value: "name-win" },
    { label: "Open nested →", value: "open-nested", trigger: true },
    { label: "Switch Window", value: "switch-win" },
    { label: "New Terminal", value: "new-term" },
  ],
  [
    { label: "Welcome", value: "welcome" },
    { label: "Playground", value: "playground" },
    { label: "Export", value: "export" },
  ],
]

const rootService = useMachine(menu.machine, { id: useId() })
const root = computed(() => menu.connect(rootService, normalizeProps))

const subService = useMachine(menu.machine, { id: useId() })
const sub = computed(() => menu.connect(subService, normalizeProps))

const sub2Service = useMachine(menu.machine, { id: useId() })
const sub2 = computed(() => menu.connect(sub2Service, normalizeProps))

onMounted(() => {
  root.value.setChild(subService)
  sub.value.setParent(rootService)
})

onMounted(() => {
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

      <Teleport to="body" v-if="root.open">
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

      <Teleport to="body" v-if="sub.open">
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

      <Teleport to="body" v-if="sub2.open">
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
</template>

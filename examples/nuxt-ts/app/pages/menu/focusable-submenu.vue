<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/menu.css"

// Hovering between submenu triggers whose content holds an input must not close the parent menu

const rootService = useMachine(menu.machine, { id: useId() })
const root = computed(() => menu.connect(rootService, normalizeProps))

const sub1Service = useMachine(menu.machine, { id: useId() })
const sub1 = computed(() => menu.connect(sub1Service, normalizeProps))

const sub2Service = useMachine(menu.machine, { id: useId() })
const sub2 = computed(() => menu.connect(sub2Service, normalizeProps))

const sub3Service = useMachine(menu.machine, { id: useId() })
const sub3 = computed(() => menu.connect(sub3Service, normalizeProps))

onMounted(() => {
  root.value.setChild(sub1Service)
  sub1.value.setParent(rootService)
  root.value.setChild(sub2Service)
  sub2.value.setParent(rootService)
  root.value.setChild(sub3Service)
  sub3.value.setParent(rootService)
})

const sub1TriggerProps = computed(() => root.value.getTriggerItemProps(sub1.value))
const sub2TriggerProps = computed(() => root.value.getTriggerItemProps(sub2.value))
const sub3TriggerProps = computed(() => root.value.getTriggerItemProps(sub3.value))
</script>

<template>
  <main>
    <div>
      <button data-testid="trigger" v-bind="root.getTriggerProps()">Open Menu</button>

      <Teleport to="#teleports">
        <div v-bind="root.getPositionerProps()">
          <ul data-testid="menu" v-bind="root.getContentProps()">
            <li v-bind="root.getItemProps({ value: 'item1' })">Regular Item 1</li>
            <li data-testid="sub1-trigger" v-bind="sub1TriggerProps">Submenu with Input 1 →</li>
            <li data-testid="sub2-trigger" v-bind="sub2TriggerProps">Submenu with Input 2 →</li>
            <li data-testid="sub3-trigger" v-bind="sub3TriggerProps">Submenu with Input 3 →</li>
            <li v-bind="root.getItemProps({ value: 'item2' })">Regular Item 2</li>
          </ul>
        </div>
      </Teleport>

      <Teleport to="#teleports">
        <div v-bind="sub1.getPositionerProps()">
          <div data-testid="sub1-content" v-bind="sub1.getContentProps()">
            <input placeholder="Type here..." style="padding: 8px; margin: 8px" />
          </div>
        </div>
      </Teleport>

      <Teleport to="#teleports">
        <div v-bind="sub2.getPositionerProps()">
          <div data-testid="sub2-content" v-bind="sub2.getContentProps()">
            <input placeholder="Type here..." style="padding: 8px; margin: 8px" />
          </div>
        </div>
      </Teleport>

      <Teleport to="#teleports">
        <div v-bind="sub3.getPositionerProps()">
          <div data-testid="sub3-content" v-bind="sub3.getContentProps()">
            <input placeholder="Type here..." style="padding: 8px; margin: 8px" />
          </div>
        </div>
      </Teleport>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="rootService" label="Root" />
    <StateVisualizer :state="sub1Service" label="Sub1" />
    <StateVisualizer :state="sub2Service" label="Sub2" />
    <StateVisualizer :state="sub3Service" label="Sub3" />
  </Toolbar>
</template>

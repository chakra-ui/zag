<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/menu.css"

// Moving quickly between adjacent submenu triggers must not open then close the next submenu

const rootService = useMachine(menu.machine, { id: useId() })
const root = computed(() => menu.connect(rootService, normalizeProps))

const jsService = useMachine(menu.machine, { id: useId() })
const js = computed(() => menu.connect(jsService, normalizeProps))

const loremService = useMachine(menu.machine, { id: useId() })
const lorem = computed(() => menu.connect(loremService, normalizeProps))

const cssService = useMachine(menu.machine, { id: useId() })
const css = computed(() => menu.connect(cssService, normalizeProps))

onMounted(() => {
  root.value.setChild(jsService)
  js.value.setParent(rootService)
  root.value.setChild(loremService)
  lorem.value.setParent(rootService)
  root.value.setChild(cssService)
  css.value.setParent(rootService)
})

const jsTriggerProps = computed(() => root.value.getTriggerItemProps(js.value))
const loremTriggerProps = computed(() => root.value.getTriggerItemProps(lorem.value))
const cssTriggerProps = computed(() => root.value.getTriggerItemProps(css.value))
</script>

<template>
  <main>
    <div>
      <button data-testid="trigger" v-bind="root.getTriggerProps()">Open Menu</button>

      <Teleport to="#teleports">
        <div v-bind="root.getPositionerProps()">
          <ul data-testid="menu" v-bind="root.getContentProps()">
            <li v-bind="root.getItemProps({ value: 'new-file' })">New File</li>
            <li data-testid="js-trigger" v-bind="jsTriggerProps">JS Frameworks →</li>
            <li data-testid="lorem-trigger" v-bind="loremTriggerProps">Lorem Ipsum →</li>
            <li data-testid="css-trigger" v-bind="cssTriggerProps">CSS Frameworks →</li>
            <li v-bind="root.getItemProps({ value: 'settings' })">Settings</li>
          </ul>
        </div>
      </Teleport>

      <Teleport to="#teleports">
        <div v-bind="js.getPositionerProps()">
          <ul data-testid="js-submenu" v-bind="js.getContentProps()">
            <li v-bind="js.getItemProps({ value: 'react' })">React</li>
            <li v-bind="js.getItemProps({ value: 'solid' })">Solid</li>
            <li v-bind="js.getItemProps({ value: 'vue' })">Vue</li>
            <li v-bind="js.getItemProps({ value: 'svelte' })">Svelte</li>
          </ul>
        </div>
      </Teleport>

      <Teleport to="#teleports">
        <div v-bind="lorem.getPositionerProps()">
          <ul data-testid="lorem-submenu" v-bind="lorem.getContentProps()">
            <li v-bind="lorem.getItemProps({ value: 'dolor' })">Dolor</li>
            <li v-bind="lorem.getItemProps({ value: 'sit' })">Sit</li>
            <li v-bind="lorem.getItemProps({ value: 'amet' })">Amet</li>
          </ul>
        </div>
      </Teleport>

      <Teleport to="#teleports">
        <div v-bind="css.getPositionerProps()">
          <ul data-testid="css-submenu" v-bind="css.getContentProps()">
            <li v-bind="css.getItemProps({ value: 'panda' })">Panda</li>
            <li v-bind="css.getItemProps({ value: 'tailwind' })">Tailwind</li>
            <li v-bind="css.getItemProps({ value: 'css-modules' })">CSS Modules</li>
          </ul>
        </div>
      </Teleport>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="rootService" label="Root" />
    <StateVisualizer :state="jsService" label="JS Submenu" />
    <StateVisualizer :state="loremService" label="Lorem Submenu" />
    <StateVisualizer :state="cssService" label="CSS Submenu" />
  </Toolbar>
</template>

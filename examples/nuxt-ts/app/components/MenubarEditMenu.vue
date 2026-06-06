<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, inject, onMounted } from "vue"

const menubarContext = inject<menu.MenubarContext | undefined>("menubar", undefined)
const service = useMachine(menu.machine, { id: "edit", menubar: menubarContext })
const api = computed(() => menu.connect(service, normalizeProps))

// The submenu is not a menubar menu (no `menubar` prop) — it's linked via setParent/setChild.
const subService = useMachine(menu.machine, { id: "find" })
const sub = computed(() => menu.connect(subService, normalizeProps))

onMounted(() => {
  api.value.setChild(subService)
  sub.value.setParent(service)
})
</script>

<template>
  <button data-testid="edit:trigger" v-bind="api.getTriggerProps()">Edit</button>
  <Teleport to="body" v-if="api.open">
    <div v-bind="api.getPositionerProps()">
      <ul data-testid="edit:content" v-bind="api.getContentProps()">
        <li data-testid="undo" v-bind="api.getItemProps({ value: 'undo' })">Undo</li>
        <li data-testid="redo" v-bind="api.getItemProps({ value: 'redo' })">Redo</li>
        <li data-testid="find:trigger" v-bind="api.getTriggerItemProps(sub)">Find ▸</li>
      </ul>
    </div>
  </Teleport>
  <Teleport to="body" v-if="sub.open">
    <div v-bind="sub.getPositionerProps()">
      <ul data-testid="find:content" v-bind="sub.getContentProps()">
        <li data-testid="find-text" v-bind="sub.getItemProps({ value: 'find-text' })">Find...</li>
        <li data-testid="replace" v-bind="sub.getItemProps({ value: 'replace' })">Replace...</li>
        <li data-testid="find-in-files" v-bind="sub.getItemProps({ value: 'find-in-files' })">Find in Files...</li>
      </ul>
    </div>
  </Teleport>
</template>

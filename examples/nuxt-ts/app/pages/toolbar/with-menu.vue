<script setup lang="ts">
import * as menu from "@zag-js/menu"
import * as toolbar from "@zag-js/toolbar"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/toolbar.css"
import "@styles/menu.css"

const service = useMachine(toolbar.machine, { id: useId() })
const api = computed(() => toolbar.connect(service, normalizeProps))

const menuId = useId()
const menuService = useMachine(
  menu.machine,
  computed(() => ({
    id: menuId,
    ids: { trigger: api.value.getItemId("more") },
    onSelect: console.log,
  })),
)
const menuApi = computed(() => menu.connect(menuService, normalizeProps))
</script>

<template>
  <main class="toolbar">
    <div v-bind="api.getRootProps()">
      <button v-bind="api.getItemProps({ value: 'cut' })">Cut</button>
      <button v-bind="api.getItemProps({ value: 'copy' })">Copy</button>
      <button v-bind="api.getItemProps({ value: 'paste' })">Paste</button>
      <div v-bind="api.getSeparatorProps()" />
      <button v-bind="mergeProps(menuApi.getTriggerProps(), api.getItemProps({ value: 'more' }))">
        More actions <span v-bind="menuApi.getIndicatorProps()">v</span>
      </button>
      <Teleport to="#teleports">
        <div v-if="menuApi.open" v-bind="menuApi.getPositionerProps()">
          <ul v-bind="menuApi.getContentProps()">
            <li v-bind="menuApi.getItemProps({ value: 'help' })">Help</li>
            <li v-bind="menuApi.getItemProps({ value: 'shortcuts' })">Keyboard Shortcuts</li>
            <li v-bind="menuApi.getItemProps({ value: 'release-notes' })">Release Notes</li>
          </ul>
        </div>
      </Teleport>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>


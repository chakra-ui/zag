<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/menu.css"

const service = useMachine(menu.machine, { id: useId() })
const root = computed(() => menu.connect(service, normalizeProps))

const subService = useMachine(menu.machine, { id: useId() })
const sub = computed(() => menu.connect(subService, normalizeProps))

onMounted(() => {
  root.value.setChild(subService)
  sub.value.setParent(service)
})

const triggerItemProps = computed(() => root.value.getTriggerItemProps(sub.value))
</script>

<template>
  <main>
    <div v-bind="root.getContextTriggerProps()">
      <div>Open context menu</div>
    </div>
    <Teleport to="#teleports">
      <div v-bind="root.getPositionerProps()">
        <div v-bind="root.getContentProps()">
          <ul v-bind="root.getListProps()">
            <li v-bind="root.getItemProps({ value: 'edit' })">Edit</li>
            <li v-bind="root.getItemProps({ value: 'delete' })">Delete</li>
            <li v-bind="root.getItemProps({ value: 'export' })">Export</li>
            <li v-bind="triggerItemProps">
              <div>Appearance ➡️</div>
            </li>
            <li v-bind="root.getItemProps({ value: 'duplicate' })">Duplicate</li>
          </ul>
        </div>
      </div>
    </Teleport>

    <Teleport to="#teleports">
      <div v-bind="sub.getPositionerProps()">
        <div v-bind="sub.getContentProps()">
          <ul v-bind="sub.getListProps()">
            <li v-bind="sub.getItemProps({ value: 'full-screen' })">Full screen</li>
            <li v-bind="sub.getItemProps({ value: 'zoom-in' })">Zoom in</li>
            <li v-bind="sub.getItemProps({ value: 'zoom-out' })">Zoom out</li>
          </ul>
        </div>
      </div>
    </Teleport>
  </main>
</template>

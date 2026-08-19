<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, inject } from "vue"

const props = defineProps<{
  id: string
  label: string
  items: { value: string; label: string }[]
}>()

const menubarContext = inject<menu.MenubarContext | undefined>("menubar", undefined)
const service = useMachine(menu.machine, { id: props.id, menubar: menubarContext })
const api = computed(() => menu.connect(service, normalizeProps))
</script>

<template>
  <button :data-testid="`${props.id}:trigger`" v-bind="api.getTriggerProps()">{{ props.label }}</button>
  <Teleport to="body" v-if="api.open">
    <div v-bind="api.getPositionerProps()">
      <ul :data-testid="`${props.id}:content`" v-bind="api.getContentProps()">
        <li
          v-for="item in props.items"
          :key="item.value"
          :data-testid="item.value"
          v-bind="api.getItemProps({ value: item.value })"
        >
          {{ item.label }}
        </li>
      </ul>
    </div>
  </Teleport>
</template>

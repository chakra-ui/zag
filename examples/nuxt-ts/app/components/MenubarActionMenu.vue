<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"
import type { ComputedRef } from "vue"

interface Action {
  value: string
  label: string
  shortcut?: string
  disabled?: boolean
}

const props = defineProps<{ id: string; label: string; actions: Action[] }>()
const emit = defineEmits<{ run: [label: string] }>()

const menubarContext = inject<ComputedRef<menu.MenubarContext> | undefined>("menubar", undefined)
const service = useMachine(
  menu.machine,
  computed<menu.Props>(() => ({
    id: props.id,
    menubar: menubarContext ? menubarContext.value : undefined,
    onSelect: (details) => {
      const action = props.actions.find((item) => item.value === details.value)
      if (action) emit("run", action.label)
    },
  })),
)
const api = computed(() => menu.connect(service, normalizeProps))
</script>

<template>
  <button v-bind="api.getTriggerProps()">{{ props.label }}</button>
  <Teleport v-if="api.open" to="#teleports">
    <div v-bind="api.getPositionerProps()">
      <ul v-bind="api.getContentProps()">
        <li
          v-for="action in props.actions"
          :key="action.value"
          v-bind="api.getItemProps({ value: action.value, disabled: action.disabled })"
        >
          {{ action.label }}
          <kbd v-if="action.shortcut" class="shortcut">{{ action.shortcut }}</kbd>
        </li>
      </ul>
    </div>
  </Teleport>
</template>

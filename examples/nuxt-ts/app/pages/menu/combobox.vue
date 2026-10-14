<script setup lang="ts">
import type * as combobox from "@zag-js/combobox"
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/menu.css"
import "@styles/combobox.css"

const menuService = useMachine(menu.machine, {
  id: useId(),
  composite: false,
})

const menuApi = computed(() => menu.connect(menuService, normalizeProps))

const onValueChange = ({ items }: combobox.ValueChangeDetails) => {
  console.log(JSON.stringify(items[0]?.label))
  menuApi.value.setOpen(false)
}
</script>

<template>
  <main>
    <div>
      <button v-bind="menuApi.getTriggerProps()">Actions ▾</button>
      <Teleport v-if="menuApi.open" to="#teleports">
        <div v-bind="menuApi.getPositionerProps()">
          <ul v-bind="menuApi.getContentProps()">
            <MenuComboboxSearch :on-value-change="onValueChange" />
          </ul>
        </div>
      </Teleport>
    </div>
  </main>
</template>

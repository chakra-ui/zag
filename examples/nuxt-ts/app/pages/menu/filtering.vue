<script setup lang="ts">
import { createFilter } from "@zag-js/i18n-utils"
import * as menu from "@zag-js/menu"
import { menuFilterData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/menu.css"

const { contains } = createFilter({ sensitivity: "base" })
const query = ref("")

const service = useMachine(menu.machine, {
  id: useId(),
  composite: false,
  onOpenChange(details) {
    if (!details.open) query.value = ""
  },
})

const api = computed(() => menu.connect(service, normalizeProps))
const items = computed(() => menuFilterData.actions.filter((item) => contains(item.label, query.value)))
</script>

<template>
  <main>
    <div>
      <button data-testid="trigger" v-bind="api.getTriggerProps()">Actions</button>
      <Teleport to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <div data-testid="menu" v-bind="api.getContentProps()">
            <input
              data-testid="input"
              aria-label="Filter actions"
              placeholder="Search actions..."
              v-bind="api.getInputProps()"
              :value="query"
              @input="query = ($event.target as HTMLInputElement).value"
            />
            <div v-if="items.length === 0" data-menu-empty>No actions found</div>
            <div v-bind="api.getListProps()">
              <div
                v-for="item in items"
                :key="item.value"
                :data-testid="item.value"
                v-bind="api.getItemProps({ value: item.value })"
              >
                {{ item.label }}
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

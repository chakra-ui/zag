<script setup lang="ts">
import { createFilter } from "@zag-js/i18n-utils"
import * as menu from "@zag-js/menu"
import { menuFilterData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/menu.css"

const { contains } = createFilter({ sensitivity: "base" })
const query = ref("")
const folderMenuId = useId()

const service = useMachine(menu.machine, {
  id: useId(),
  composite: false,
  onOpenChange(details) {
    if (!details.open) query.value = ""
  },
})

const api = computed(() => menu.connect(service, normalizeProps))
const actions = computed(() => menuFilterData.actions.filter((item) => contains(item.label, query.value)))
const showMoveTo = computed(() => contains("Move to folder", query.value))
</script>

<template>
  <main>
    <div>
      <button data-testid="trigger" v-bind="api.getTriggerProps()">File</button>
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
            <div v-if="actions.length === 0 && !showMoveTo" data-menu-empty>No actions found</div>
            <div v-bind="api.getListProps()">
              <div
                v-for="item in actions"
                :key="item.value"
                :data-testid="item.value"
                v-bind="api.getItemProps({ value: item.value })"
              >
                {{ item.label }}
              </div>
              <MenuFolderSubmenu v-if="showMoveTo" :id="folderMenuId" :parent-service="service" :parent="api" />
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

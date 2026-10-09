<script setup lang="ts">
import { createFilter } from "@zag-js/i18n-utils"
import * as menu from "@zag-js/menu"
import { menuFilterData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

// Rendered only while its trigger matches the parent's query, so filtering the trigger out removes the submenu
const props = defineProps<{ id: string; parentService: menu.Service; parent: menu.Api }>()

const { contains } = createFilter({ sensitivity: "base" })
const query = ref("")

const service = useMachine(menu.machine, {
  id: props.id,
  composite: false,
  onOpenChange(details) {
    if (!details.open) query.value = ""
  },
})

const api = computed(() => menu.connect(service, normalizeProps))
const folders = computed(() => menuFilterData.folders.filter((item) => contains(item.label, query.value)))
const triggerItemProps = computed(() => props.parent.getTriggerItemProps(api.value))

onMounted(() => {
  props.parent.setChild(service)
  api.value.setParent(props.parentService)
})
</script>

<template>
  <div data-testid="move-to-folder" v-bind="triggerItemProps">Move to folder →</div>
  <Teleport to="#teleports">
    <div v-bind="api.getPositionerProps()">
      <div data-testid="folders-submenu" v-bind="api.getContentProps()">
        <input
          data-testid="folders-input"
          aria-label="Filter folders"
          placeholder="Search folders..."
          v-bind="api.getInputProps()"
          :value="query"
          @input="query = ($event.target as HTMLInputElement).value"
        />
        <div v-if="folders.length === 0" data-menu-empty>No folders found</div>
        <div v-bind="api.getListProps()">
          <div
            v-for="item in folders"
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
</template>

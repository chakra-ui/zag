<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/menu.css"

const rootItems = [
  { label: "New File", value: "new-file" },
  { label: "Share →", value: "share" },
  { label: "Export →", value: "export" },
  { label: "Delete", value: "delete" },
]

const submenuItems: Record<string, { label: string; value: string }[]> = {
  share: [
    { label: "Email", value: "email" },
    { label: "Copy Link", value: "copy-link" },
  ],
  export: [
    { label: "PDF", value: "pdf" },
    { label: "PNG", value: "png" },
  ],
}

function useControlledMenu() {
  const id = useId()
  const open = ref(false)
  return useMachine(
    menu.machine,
    computed(() => ({
      id,
      open: open.value,
      onOpenChange: (details: menu.OpenChangeDetails) => (open.value = details.open),
    })),
  )
}

const rootService = useControlledMenu()
const root = computed(() => menu.connect(rootService, normalizeProps))

const shareService = useControlledMenu()
const share = computed(() => menu.connect(shareService, normalizeProps))

const exportService = useControlledMenu()
const exportMenu = computed(() => menu.connect(exportService, normalizeProps))

const submenus = computed(() => [
  { value: "share", service: shareService, api: share.value },
  { value: "export", service: exportService, api: exportMenu.value },
])

onMounted(() => {
  submenus.value.forEach(({ service, api }) => {
    root.value.setChild(service)
    api.setParent(rootService)
  })
})

function getRootItemProps(value: string) {
  const sub = submenus.value.find((s) => s.value === value)
  return sub ? root.value.getTriggerItemProps(sub.api) : root.value.getItemProps({ value })
}
</script>

<template>
  <main>
    <div>
      <button data-testid="trigger" v-bind="root.getTriggerProps()">Click me</button>

      <Teleport to="#teleports">
        <div v-bind="root.getPositionerProps()">
          <ul data-testid="menu" v-bind="root.getContentProps()">
            <li
              v-for="item in rootItems"
              :key="item.value"
              :data-testid="item.value"
              v-bind="getRootItemProps(item.value)"
            >
              {{ item.label }}
            </li>
          </ul>
        </div>
      </Teleport>

      <Teleport v-for="sub in submenus" :key="sub.value" to="#teleports">
        <div v-bind="sub.api.getPositionerProps()">
          <ul :data-testid="`${sub.value}-submenu`" v-bind="sub.api.getContentProps()">
            <li
              v-for="item in submenuItems[sub.value]"
              :key="item.value"
              :data-testid="item.value"
              v-bind="sub.api.getItemProps({ value: item.value })"
            >
              {{ item.label }}
            </li>
          </ul>
        </div>
      </Teleport>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="rootService" label="Root Machine" />
    <StateVisualizer :state="shareService" label="Share Machine" />
    <StateVisualizer :state="exportService" label="Export Machine" />
  </Toolbar>
</template>

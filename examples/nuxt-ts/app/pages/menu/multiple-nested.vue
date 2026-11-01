<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/menu.css"

// Moving from a trigger to its submenu across other triggers must keep the owning trigger highlighted
const rootItems = [
  { label: "Platform →", value: "platform", trigger: true },
  { label: "Solutions →", value: "solutions", trigger: true },
  { label: "Resources →", value: "resources", trigger: true },
  { label: "Open Source →", value: "open-source", trigger: true },
]

const platformItems = [
  { label: "GitHub Copilot", value: "copilot" },
  { label: "GitHub Spark", value: "spark" },
  { label: "GitHub Models", value: "models" },
  { label: "MCP Registry", value: "mcp" },
]

const solutionsItems = [
  { label: "Enterprises", value: "enterprises" },
  { label: "Small and medium teams", value: "teams" },
  { label: "Startups", value: "startups" },
]

const resourcesItems = [
  { label: "Documentation", value: "docs" },
  { label: "Blog", value: "blog" },
  { label: "Changelog", value: "changelog" },
]

const openSourceItems = [
  { label: "GitHub Sponsors", value: "sponsors" },
  { label: "Security Lab", value: "security-lab" },
  { label: "Trending", value: "trending" },
]

const submenuItems: Record<string, typeof platformItems> = {
  platform: platformItems,
  solutions: solutionsItems,
  resources: resourcesItems,
  "open-source": openSourceItems,
}

const rootService = useMachine(menu.machine, { id: useId() })
const root = computed(() => menu.connect(rootService, normalizeProps))

const submenuServices = [
  { value: "platform", service: useMachine(menu.machine, { id: useId() }) },
  { value: "solutions", service: useMachine(menu.machine, { id: useId() }) },
  { value: "resources", service: useMachine(menu.machine, { id: useId() }) },
  { value: "open-source", service: useMachine(menu.machine, { id: useId() }) },
]

const submenus = computed(() =>
  submenuServices.map(({ value, service }) => ({ value, service, api: menu.connect(service, normalizeProps) })),
)

onMounted(() => {
  submenus.value.forEach(({ service, api }) => {
    root.value.setChild(service)
    api.setParent(rootService)
  })
})

const getRootItemProps = (item: (typeof rootItems)[number]) => {
  const sub = submenus.value.find((s) => s.value === item.value)
  return item.trigger && sub ? root.value.getTriggerItemProps(sub.api) : root.value.getItemProps({ value: item.value })
}
</script>

<template>
  <main style="padding: 40px">
    <p style="margin-bottom: 16px; color: var(--text-muted)">
      Hover a trigger to open its submenu, then move the pointer into the submenu while passing over other triggers. The
      trigger that owns the open submenu should stay highlighted.
    </p>

    <button data-testid="trigger" v-bind="root.getTriggerProps()">Open menu</button>

    <Teleport v-if="root.open" to="#teleports">
      <div v-bind="root.getPositionerProps()">
        <ul data-testid="root-menu" v-bind="root.getContentProps()">
          <li v-for="item in rootItems" :key="item.value" :data-testid="item.value" v-bind="getRootItemProps(item)">
            {{ item.label }}
          </li>
        </ul>
      </div>
    </Teleport>

    <template v-for="{ value, api } in submenus" :key="value">
      <Teleport v-if="api.open" to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <ul :data-testid="`submenu-${value}`" v-bind="api.getContentProps()">
            <li
              v-for="item in submenuItems[value] ?? []"
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
  </main>
</template>

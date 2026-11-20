<script setup lang="ts">
import * as navigationMenu from "@zag-js/navigation-menu"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronDown } from "lucide-vue-next"
import { useId } from "vue"
import "@styles/navigation-menu.css"

const sections = [
  { value: "guides", label: "Guides", pages: ["Getting started", "Styling", "Accessibility"] },
  { value: "components", label: "Components", pages: ["Accordion", "Dialog", "Menu"] },
]

const currentPage = ref("Getting started")

const service = useMachine(navigationMenu.machine, { id: useId() })
const api = computed(() => navigationMenu.connect(service, normalizeProps))

const getPageLinkProps = (value: string, page: string) =>
  api.value.getLinkProps({
    value,
    current: currentPage.value === page,
    onSelect: () => (currentPage.value = page),
  })
</script>

<template>
  <main>
    <div class="navigation-menu-links">
      <p class="hint">Pick a page. The menu closes and the link you picked becomes the current page.</p>
      <nav v-bind="api.getRootProps()">
        <div v-bind="api.getListProps()">
          <div v-for="section in sections" :key="section.value" v-bind="api.getItemProps({ value: section.value })">
            <button v-bind="api.getTriggerProps({ value: section.value })">
              {{ section.label }}
              <ChevronDown />
            </button>
            <Presence v-bind="api.getContentProps({ value: section.value })">
              <a
                v-for="page in section.pages"
                :key="page"
                :href="`#${page.toLowerCase().replaceAll(' ', '-')}`"
                v-bind="getPageLinkProps(section.value, page)"
              >
                {{ page }}
              </a>
            </Presence>
          </div>
          <div v-bind="api.getItemProps({ value: 'changelog' })">
            <a href="#changelog" v-bind="getPageLinkProps('changelog', 'Changelog')">Changelog</a>
          </div>
        </div>
      </nav>
      <p class="status">You're on <strong data-testid="current-page">{{ currentPage }}</strong></p>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" :context="['value', 'previousValue']" />
  </Toolbar>
</template>

<script setup lang="ts">
import * as navigationMenu from "@zag-js/navigation-menu"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronRight } from "lucide-vue-next"
import { useId } from "vue"
import "@styles/navigation-menu.css"

const sections = [
  { value: "account", label: "Account", links: ["Profile", "Security", "Connected apps"] },
  { value: "billing", label: "Billing", links: ["Invoices", "Payment methods"], disabled: true },
  { value: "notifications", label: "Notifications", links: ["Email", "Push"] },
]

const service = useMachine(navigationMenu.machine, { id: useId(), orientation: "vertical" })
const api = computed(() => navigationMenu.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div class="navigation-menu-vertical">
      <p class="hint">Billing is disabled</p>
      <nav v-bind="api.getRootProps()">
        <div v-bind="api.getListProps()">
          <div
            v-for="section in sections"
            :key="section.value"
            v-bind="api.getItemProps({ value: section.value, disabled: section.disabled })"
          >
            <button v-bind="api.getTriggerProps({ value: section.value, disabled: section.disabled })">
              {{ section.label }}
              <ChevronRight />
            </button>
            <Presence v-bind="api.getContentProps({ value: section.value })">
              <a
                v-for="link in section.links"
                :key="link"
                :href="`#${link}`"
                v-bind="api.getLinkProps({ value: section.value })"
              >
                {{ link }}
              </a>
            </Presence>
          </div>
        </div>
      </nav>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" :context="['value', 'previousValue']" />
  </Toolbar>
</template>

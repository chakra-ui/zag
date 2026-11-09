<script setup lang="ts">
import * as tabs from "@zag-js/tabs"
import { normalizeProps, useMachine } from "@zag-js/vue"
import Presence from "~/components/Presence.vue"
import "@styles/tabs.css"

const items = [
  { value: "overview", label: "Overview", content: "Workspace stats and activity." },
  { value: "projects", label: "Projects", content: "Milestones and deadlines." },
  { value: "account", label: "Account", content: "Profile and preferences." },
]

const service = useMachine(tabs.machine, {
  id: useId(),
  defaultValue: "overview",
})

const api = computed(() => tabs.connect(service, normalizeProps))
</script>

<template>
  <main class="tabs">
    <div v-bind="api.getRootProps()" class="animated-tabs">
      <div v-bind="api.getListProps()">
        <button v-for="item in items" :key="item.value" v-bind="api.getTriggerProps({ value: item.value })">
          {{ item.label }}
        </button>
        <div v-bind="api.getIndicatorProps()" />
      </div>
      <div class="animated-tabs__viewport">
        <Presence
          v-for="item in items"
          :key="item.value"
          v-bind="api.getContentProps({ value: item.value })"
          skip-animation-on-mount
        >
          <p>{{ item.content }}</p>
        </Presence>
      </div>
    </div>
  </main>
</template>

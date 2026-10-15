<script setup lang="ts">
import * as accordion from "@zag-js/accordion"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ArrowRight } from "lucide-vue-next"
import "@styles/accordion.css"

const sections = [
  { value: "profile", title: "Profile", content: "Update your name, avatar, and the email shown to teammates." },
  {
    value: "notifications",
    title: "Notifications",
    content: "Choose which activity sends you an email or push alert.",
  },
  {
    value: "billing",
    title: "Billing",
    content: "Manage the plan, payment method, and invoices for this workspace.",
    disabled: true,
  },
  { value: "security", title: "Security", content: "Turn on two-factor authentication and review active sessions." },
]

const service = useMachine(accordion.machine, {
  id: useId(),
  defaultValue: ["profile"],
})

const api = computed(() => accordion.connect(service, normalizeProps))
</script>

<template>
  <main class="accordion">
    <div class="accordion-layout">
      <div v-bind="api.getRootProps()">
        <div
          v-for="{ value, title, content, disabled } in sections"
          :key="value"
          v-bind="api.getItemProps({ value, disabled })"
        >
          <h3 v-bind="api.getItemHeaderProps({ value, disabled })">
            <button v-bind="api.getItemTriggerProps({ value, disabled })">
              {{ title }}
              <span v-bind="api.getItemIndicatorProps({ value, disabled })"><ArrowRight /></span>
            </button>
          </h3>
          <div v-bind="api.getItemContentProps({ value, disabled })">
            <div class="accordion-item-body">{{ content }}</div>
          </div>
        </div>
      </div>
      <p class="accordion-hint">Billing is disabled: only workspace admins can change it.</p>
    </div>
  </main>
</template>

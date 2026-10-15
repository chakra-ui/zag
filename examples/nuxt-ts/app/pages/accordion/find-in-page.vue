<script setup lang="ts">
import * as accordion from "@zag-js/accordion"
import { accordionFaqData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ArrowRight } from "lucide-vue-next"
import "@styles/accordion.css"

const service = useMachine(accordion.machine, { id: useId(), hiddenUntilFound: true })
const api = computed(() => accordion.connect(service, normalizeProps))
</script>

<template>
  <main class="accordion">
    <div class="accordion-layout">
      <p class="accordion-hint">Search the page for “refund” or “invoices” to open the matching answer.</p>
      <div v-bind="api.getRootProps()">
        <div v-for="item in accordionFaqData" :key="item.value" v-bind="api.getItemProps({ value: item.value })">
          <h3 v-bind="api.getItemHeaderProps({ value: item.value })">
            <button v-bind="api.getItemTriggerProps({ value: item.value })">
              {{ item.title }}
              <span v-bind="api.getItemIndicatorProps({ value: item.value })"><ArrowRight /></span>
            </button>
          </h3>
          <div v-bind="api.getItemContentProps({ value: item.value })">
            <div class="accordion-item-body">{{ item.content }}</div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

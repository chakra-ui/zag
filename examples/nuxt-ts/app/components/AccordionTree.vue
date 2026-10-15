<script setup lang="ts">
import * as accordion from "@zag-js/accordion"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ArrowRight } from "lucide-vue-next"

export interface AccordionTreeItem {
  value: string
  title: string
  content?: string
  children?: AccordionTreeItem[]
}

defineProps<{ items: AccordionTreeItem[] }>()

// Each level is its own machine, so arrow keys only move within one level
const service = useMachine(accordion.machine, { id: useId(), multiple: true })
const api = computed(() => accordion.connect(service, normalizeProps))
</script>

<template>
  <div v-bind="api.getRootProps()">
    <div v-for="item in items" :key="item.value" v-bind="api.getItemProps({ value: item.value })">
      <h3 v-bind="api.getItemHeaderProps({ value: item.value })">
        <button v-bind="api.getItemTriggerProps({ value: item.value })">
          {{ item.title }}
          <span v-bind="api.getItemIndicatorProps({ value: item.value })"><ArrowRight /></span>
        </button>
      </h3>
      <div v-bind="api.getItemContentProps({ value: item.value })">
        <div class="accordion-item-body">
          {{ item.content }}
          <AccordionTree v-if="item.children" :items="item.children" />
        </div>
      </div>
    </div>
  </div>
</template>

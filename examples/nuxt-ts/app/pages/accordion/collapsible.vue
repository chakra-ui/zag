<script setup lang="ts">
import * as accordion from "@zag-js/accordion"
import { accordionFaqData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ArrowRight } from "lucide-vue-next"
import "@styles/accordion.css"
import "@styles/collapsible.css"

const service = useMachine(accordion.machine, {
  id: useId(),
  multiple: true,
  defaultValue: ["shipping"],
})

const api = computed(() => accordion.connect(service, normalizeProps))

const getContentProps = (value: string) => {
  const { hidden: _, ...rest } = api.value.getItemContentProps({ value })
  return rest
}
</script>

<template>
  <main class="accordion">
    <div class="accordion-layout">
      <p class="accordion-hint">Search the page for “invoices” to open the matching answer.</p>
      <div v-bind="api.getRootProps()">
        <div v-for="item in accordionFaqData" :key="item.value" v-bind="api.getItemProps({ value: item.value })">
          <h3 v-bind="api.getItemHeaderProps({ value: item.value })">
            <button v-bind="api.getItemTriggerProps({ value: item.value })">
              {{ item.title }}
              <div v-bind="api.getItemIndicatorProps({ value: item.value })">
                <ArrowRight />
              </div>
            </button>
          </h3>
          <AccordionCollapsibleContent
            v-bind="getContentProps(item.value)"
            :open="api.getItemState({ value: item.value }).expanded"
            @open-change="
              (open: boolean) =>
                api.setValue(open ? [...api.value, item.value] : api.value.filter((v) => v !== item.value))
            "
          >
            <p class="accordion-item-body">{{ item.content }}</p>
          </AccordionCollapsibleContent>
        </div>
      </div>
    </div>
  </main>
</template>

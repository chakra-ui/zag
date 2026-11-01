<script setup lang="ts">
import * as accordion from "@zag-js/accordion"
import { accordionFaqData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ArrowRight } from "lucide-vue-next"
import "@styles/accordion.css"

const value = ref<string[]>(["shipping"])

const id = useId()
const service = useMachine(
  accordion.machine,
  computed(() => ({
    id,
    multiple: true,
    value: value.value,
    onValueChange: (details: accordion.ValueChangeDetails) => (value.value = details.value),
  })),
)

const api = computed(() => accordion.connect(service, normalizeProps))
</script>

<template>
  <main class="accordion">
    <div class="accordion-layout">
      <div class="accordion-toolbar">
        <button @click="value = accordionFaqData.map((item) => item.value)">Expand all</button>
        <button @click="value = []">Collapse all</button>
      </div>

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

      <Output label="value" :value="value" />
    </div>
  </main>
</template>

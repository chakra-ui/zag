<script setup lang="ts">
import * as steps from "@zag-js/steps"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/steps.css"

const items: steps.StepItem[] = [
  { value: "shipping", title: "Shipping" },
  { value: "payment", title: "Payment" },
  { value: "review", title: "Review" },
]

const value = ref<string>(items[0]!.value)
const finished = ref<string[] | null>(null)

const id = useId()

const service = useMachine(
  steps.machine,
  computed(() => ({
    id,
    items,
    value: value.value,
    onValueChange(details: steps.ValueChangeDetails) {
      if (details.value) value.value = details.value
    },
    onComplete(details: steps.CompleteDetails) {
      finished.value = details.completedValues
    },
  })),
)

const api = computed(() => steps.connect(service, normalizeProps))
</script>

<template>
  <main class="steps">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getListProps()">
        <div v-for="(item, index) in items" :key="item.value" v-bind="api.getItemProps({ value: item.value })">
          <button v-bind="api.getTriggerProps({ value: item.value })">
            <div v-bind="api.getIndicatorProps({ value: item.value })">{{ index + 1 }}</div>
            <span>{{ item.title }}</span>
          </button>
          <div v-bind="api.getSeparatorProps({ value: item.value })" />
        </div>
      </div>

      <div v-for="item in items" :key="item.value" v-bind="api.getContentProps({ value: item.value })">
        {{ item.title }} content
      </div>

      <div v-bind="api.getContentProps({ value: steps.COMPLETE })">All done 🎉</div>

      <div>
        <button v-bind="api.getPrevTriggerProps()">Back</button>
        <button v-bind="api.getNextTriggerProps()">Next</button>
      </div>
    </div>

    <hr style="margin: 2rem 0" />

    <p>
      External state: <code>{{ value === steps.COMPLETE ? "complete" : value }}</code
      >, onComplete:
      <code>{{ finished ? finished.join(",") : "-" }}</code>
    </p>
    <div style="display: flex; gap: 0.5rem">
      <button v-for="item in items" :key="item.value" @click="value = item.value">Go to {{ item.title }}</button>
      <button @click="value = steps.COMPLETE">Show completed</button>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

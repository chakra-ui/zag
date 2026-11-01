<script setup lang="ts">
import * as steps from "@zag-js/steps"
import { stepsControls, stepsData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/steps.css"

const controls = useControls(stepsControls)

const service = useMachine(
  steps.machine,
  controls.mergeProps<steps.Props>({
    id: useId(),
    items: stepsData,
  }),
)

const api = computed(() => steps.connect(service, normalizeProps))
</script>

<template>
  <main class="steps">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getListProps()">
        <div v-for="(step, index) in stepsData" :key="step.value" v-bind="api.getItemProps({ value: step.value })">
          <button v-bind="api.getTriggerProps({ value: step.value })">
            <div v-bind="api.getIndicatorProps({ value: step.value })">
              {{ api.getItemState({ value: step.value }).completed ? "✓" : index + 1 }}
            </div>
            <span>{{ step.title }}</span>
          </button>
          <div v-bind="api.getSeparatorProps({ value: step.value })" />
        </div>
      </div>

      <div v-for="step in stepsData" :key="step.value" v-bind="api.getContentProps({ value: step.value })">
        {{ step.title }} - {{ step.description }}
      </div>

      <div v-bind="api.getContentProps({ value: steps.COMPLETE })">
        Steps Complete - Thank you for filling out the form!
      </div>

      <div>
        <button v-bind="api.getPreviousTriggerProps()">Back</button>
        <button v-bind="api.getSkipTriggerProps()">Skip</button>
        <button v-bind="api.getNextTriggerProps()">Next</button>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

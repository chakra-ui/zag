<script setup lang="ts">
import * as steps from "@zag-js/steps"
import { stepsControls, stepsData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const [state, send] = useMachine(
  steps.machine({
    id: "1",
    count: stepsData.length,
  }),
)

const api = computed(() => steps.connect(state.value, send, normalizeProps))
</script>

<template>
  <main class="steps">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getListProps()">
        <div v-for="(step, index) in stepsData" :key="index" v-bind="api.getItemProps({ index })">
          <button v-bind="api.getTriggerProps({ index })">
            <div v-bind="api.getIndicatorProps({ index })">{{ index + 1 }}</div>
            <span>{{ step.title }}</span>
          </button>
          <div v-bind="api.getSeparatorProps({ index })" />
        </div>
      </div>

      <div v-for="(step, index) in stepsData" :key="index" v-bind="api.getContentProps({ index })">
        {{ step.title }} - {{ step.description }}
      </div>

      <div v-bind="api.getContentProps({ index: stepsData.length })">
        Steps Complete - Thank you for filling out the form!
      </div>

      <div>
        <button v-bind="api.getPrevTriggerProps()">Back</button>
        <button v-bind="api.getNextTriggerProps()">Next</button>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
  </Toolbar>
</template>

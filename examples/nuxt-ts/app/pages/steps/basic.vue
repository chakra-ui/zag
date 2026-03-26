<script setup lang="ts">
import styles from "../../../../../shared/src/css/steps.module.css"
import * as steps from "@zag-js/steps"
import { stepsControls, stepsData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(stepsControls)

const service = useMachine(
  steps.machine,
  controls.mergeProps<steps.Props>({
    id: useId(),
    count: stepsData.length,
  }),
)

const api = computed(() => steps.connect(service, normalizeProps))
</script>

<template>
  <main class="steps">
    <div v-bind="api.getRootProps()" :class="styles.Root">
      <div v-bind="api.getListProps()" :class="styles.List">
        <div v-for="(step, index) in stepsData" :key="index" v-bind="api.getItemProps({ index })" :class="styles.Item">
          <button v-bind="api.getTriggerProps({ index })" :class="styles.Trigger">
            <div v-bind="api.getIndicatorProps({ index })" :class="styles.Indicator">{{ index + 1 }}</div>
            <span>{{ step.title }}</span>
          </button>
          <div v-bind="api.getSeparatorProps({ index })" :class="styles.Separator" />
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
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

<script setup lang="ts">
import * as dateInput from "@zag-js/date-input"
import { dateInputControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/date-input.css"

const controls = useControls(dateInputControls)

const service = useMachine(
  dateInput.machine,
  controls.mergeProps<dateInput.Props>({
    id: useId(),
  }),
)

const api = computed(() => dateInput.connect(service, normalizeProps))
</script>

<template>
  <main class="date-input">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Date</label>

      <div v-bind="api.getControlProps()">
        <div v-bind="api.getSegmentGroupProps()">
          <span v-for="(segment, i) in api.getSegments()" :key="i" v-bind="api.getSegmentProps({ segment })">{{
            segment.text
          }}</span>
        </div>
      </div>

      <input v-bind="api.getHiddenInputProps()" />
    </div>

    <output class="date-output">
      <div>Selected: {{ api.valueAsString.join(", ") || "-" }}</div>
      <div>Placeholder: {{ api.placeholderValue.toString() }}</div>
      <div>Editing: {{ api.displayValues?.[0]?.toString() ?? "-" }}</div>
    </output>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

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
    selectionMode: "range",
  }),
)

const api = computed(() => dateInput.connect(service, normalizeProps))
</script>

<template>
  <main class="date-input">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Date Range</label>

      <div v-bind="api.getControlProps()">
        <div v-bind="api.getSegmentGroupProps({ index: 0 })">
          <span
            v-for="(segment, i) in api.getSegments({ index: 0 })"
            :key="i"
            v-bind="api.getSegmentProps({ segment, index: 0 })"
            >{{ segment.text }}</span
          >
        </div>

        <span> &ndash; </span>

        <div v-bind="api.getSegmentGroupProps({ index: 1 })">
          <span
            v-for="(segment, i) in api.getSegments({ index: 1 })"
            :key="i"
            v-bind="api.getSegmentProps({ segment, index: 1 })"
            >{{ segment.text }}</span
          >
        </div>
      </div>

      <input v-bind="api.getHiddenInputProps({ index: 0 })" />
      <input v-bind="api.getHiddenInputProps({ index: 1 })" />
    </div>

    <output class="date-output">
      <div>Selected: {{ api.valueAsString.join(" - ") || "-" }}</div>
      <div>Placeholder: {{ api.placeholderValue.toString() }}</div>
      <div v-for="(date, index) in api.displayValues" :key="index">
        Editing input {{ index + 1 }}: {{ date.toString() ?? "-" }}
      </div>
    </output>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

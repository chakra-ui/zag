<script setup lang="ts">
import * as meter from "@zag-js/meter"
import { meterControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/meter.css"

const controls = useControls(meterControls)

const service = useMachine(
  meter.machine,
  controls.mergeProps<meter.Props>({
    id: useId(),
    defaultValue: 40,
    low: 20,
    high: 80,
    optimum: 90,
  }),
)

const api = computed(() => meter.connect(service, normalizeProps))

const presets = [
  { value: 10, label: "10%" },
  { value: 50, label: "50%" },
  { value: 90, label: "90%" },
]
</script>

<template>
  <main class="meter">
    <div v-bind="api.getRootProps()">
      <div style="display: flex; justify-content: space-between; align-items: baseline">
        <span v-bind="api.getLabelProps()">Battery</span>
        <span v-bind="api.getValueTextProps()">{{ api.valueAsString }} · {{ api.valueState }}</span>
      </div>
      <div v-bind="api.getTrackProps()">
        <div v-bind="api.getIndicatorProps()" />
      </div>
    </div>

    <p>
      Optimum is above <code>high</code>, so a larger value is better. 90 is optimal, 50 is suboptimal, 10 is
      least-optimal.
    </p>

    <div class="meter-actions">
      <button
        v-for="preset in presets"
        :key="preset.value"
        :data-testid="`set-${preset.value}`"
        type="button"
        @click="api.setValue(preset.value)"
      >
        Set {{ preset.label }}
      </button>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

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
    defaultValue: 70,
    low: 60,
    high: 85,
    optimum: 10,
  }),
)

const api = computed(() => meter.connect(service, normalizeProps))

const presets = [
  { value: 10, label: "10%" },
  { value: 70, label: "70%" },
  { value: 95, label: "95%" },
]
</script>

<template>
  <main class="meter">
    <div v-bind="api.getRootProps()">
      <div style="display: flex; justify-content: space-between; align-items: baseline">
        <span v-bind="api.getLabelProps()">Storage used</span>
        <span v-bind="api.getValueTextProps()">{{ api.valueAsString }} · {{ api.valueState }}</span>
      </div>
      <div v-bind="api.getTrackProps()">
        <div v-bind="api.getIndicatorProps()" />
      </div>
    </div>

    <p>
      Optimum is below <code>low</code>, so a smaller value is better. 10 is optimal, 70 is suboptimal, 95 is
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

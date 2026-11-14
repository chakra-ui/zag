<script setup lang="ts">
import * as zagSwitch from "@zag-js/switch"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { useId } from "vue"
import "@styles/switch.css"

const id = useId()
const lowPower = ref(false)

function useSetting(suffix: string, props: () => Omit<zagSwitch.Props, "id">) {
  const service = useMachine(
    zagSwitch.machine,
    computed<zagSwitch.Props>(() => ({ ...props(), id: `${id}-${suffix}` })),
  )
  return { service, api: computed(() => zagSwitch.connect(service, normalizeProps)) }
}

const power = useSetting("power", () => ({ onCheckedChange: (details) => (lowPower.value = details.checked) }))
const background = useSetting("background", () => ({ defaultChecked: true, disabled: lowPower.value }))
const location = useSetting("location", () => ({ defaultChecked: true, disabled: lowPower.value }))

const rows = [
  { label: "Low power mode", testId: "switch-low-power", api: power.api },
  { label: "Background refresh", testId: "switch-background", api: background.api },
  { label: "Location services", testId: "switch-location", api: location.api },
]
</script>

<template>
  <main>
    <div class="switch-settings">
      <p class="hint">Turn on Low power mode to pause the other two.</p>
      <div class="rows">
        <label v-for="row in rows" :key="row.testId" v-bind="row.api.value.getRootProps()">
          <input v-bind="row.api.value.getHiddenInputProps()" />
          <span v-bind="row.api.value.getControlProps()">
            <span v-bind="row.api.value.getThumbProps()" />
          </span>
          <span v-bind="row.api.value.getLabelProps()">{{ row.label }}</span>
        </label>
      </div>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="power.service" />
  </Toolbar>
</template>

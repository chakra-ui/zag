<script setup lang="ts">
import * as radio from "@zag-js/radio-group"
import { radioControls, radioData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(radioControls)

const service = useMachine(
  radio.machine,
  controls.mergeProps<radio.Props>({
    id: useId(),
    name: "fruit",
    orientation: "horizontal",
  }),
)

const api = computed(() => radio.connect(service, normalizeProps))
</script>

<template>
  <main class="segmented-control">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getIndicatorProps()" />

      <label
        v-for="opt in radioData"
        :key="opt.id"
        :data-testid="`radio-${opt.id}`"
        v-bind="api.getItemProps({ value: opt.id })"
      >
        <span :data-testid="`label-${opt.id}`" v-bind="api.getItemTextProps({ value: opt.id })">
          {{ opt.label }}
        </span>
        <input :data-testid="`input-${opt.id}`" v-bind="api.getItemHiddenInputProps({ value: opt.id })" />
      </label>
    </div>

    <button @click="api.clearValue">reset</button>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

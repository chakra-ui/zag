<script setup lang="ts">
import * as radio from "@zag-js/radio-group"
import { radioControls, radioData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(radioControls)

const [state, send] = useMachine(radio.machine({ id: "1", name: "fruit" }), {
  context: controls.context,
})

const api = computed(() => radio.connect(state.value, send, normalizeProps))
</script>

<template>
  <main class="segmented-control">
    <div v-bind="api.rootProps">
      <div v-bind="api.indicatorProps" />

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
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :config="controls.config" :state="controls.context" />
    </template>
  </Toolbar>
</template>

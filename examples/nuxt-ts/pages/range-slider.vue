<script setup lang="ts">
import * as slider from "@zag-js/slider"
import { sliderControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import serialize from "form-serialize"

const controls = useControls(sliderControls)

const service = useMachine(slider.machine, {
  id: useId(),
  name: "quantity",
  defaultValue: [10, 60],
})

const api = computed(() => slider.connect(service, normalizeProps))
</script>

<template>
  <main class="slider">
    <form
      @input="
        (e) => {
          const formData = serialize(e.currentTarget as HTMLFormElement, { hash: true })
          console.log(formData)
        }
      "
    >
      <div v-bind="api.getRootProps()">
        <div>
          <label v-bind="api.getLabelProps()">Quantity:</label>
          <output v-bind="api.getValueTextProps()">{{ api.value.join(" - ") }}</output>
        </div>
        <div class="control-area">
          <div v-bind="api.getControlProps()">
            <div v-bind="api.getTrackProps()">
              <div v-bind="api.getRangeProps()" />
            </div>
            <div v-for="(_, index) in api.value" :key="index" v-bind="api.getThumbProps({ index })">
              <input v-bind="api.getHiddenInputProps({ index })" />
            </div>
          </div>
        </div>
      </div>
    </form>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

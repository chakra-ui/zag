<script setup lang="ts">
import * as slider from "@zag-js/slider"
import { sliderControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import serialize from "form-serialize"

const controls = useControls(sliderControls)

const [state, send] = useMachine(
  slider.machine({
    id: "1",
    name: "quantity",
    value: [10, 60],
  }),
  { context: controls.context },
)

const api = computed(() => slider.connect(state.value, send, normalizeProps))
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
      <div v-bind="api.rootProps">
        <div>
          <label v-bind="api.labelProps">Quantity:</label>
          <output v-bind="api.valueTextProps">{{ api.value.join(" - ") }}</output>
        </div>
        <div class="control-area">
          <div v-bind="api.controlProps">
            <div v-bind="api.trackProps">
              <div v-bind="api.rangeProps" />
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
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

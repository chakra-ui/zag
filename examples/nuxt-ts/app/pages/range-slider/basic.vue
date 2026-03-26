<script setup lang="ts">
import styles from "../../../../../shared/src/css/slider.module.css"
import * as slider from "@zag-js/slider"
import { sliderControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import serialize from "form-serialize"

const controls = useControls(sliderControls)

const service = useMachine(
  slider.machine,
  controls.mergeProps<slider.Props>({
    id: useId(),
    name: "quantity",
    defaultValue: [10, 60],
  }),
)

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
      <div v-bind="api.getRootProps()" :class="styles.Root">
        <div>
          <label v-bind="api.getLabelProps()">Quantity:</label>
          <output v-bind="api.getValueTextProps()" :class="styles.ValueText">{{ api.value.join(" - ") }}</output>
        </div>
        <div class="control-area">
          <div v-bind="api.getControlProps()" :class="styles.Control">
            <div v-bind="api.getTrackProps()" :class="styles.Track">
              <div v-bind="api.getRangeProps()" :class="styles.Range" />
            </div>
            <div v-for="(_, index) in api.value" :key="index" v-bind="api.getThumbProps({ index })" :class="styles.Thumb">
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

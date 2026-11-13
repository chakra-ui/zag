<script setup lang="ts">
import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/color-picker.css"

const submitted = ref("")

const service = useMachine(colorPicker.machine, {
  id: useId(),
  name: "color",
  required: true,
  defaultValue: colorPicker.parse("#3b82f6"),
})

const api = computed(() => colorPicker.connect(service, normalizeProps))

const onSubmit = (event: Event) => {
  const formData = new FormData(event.currentTarget as HTMLFormElement)
  submitted.value = String(formData.get("color"))
}
</script>

<template>
  <main class="color-picker">
    <form @submit.prevent="onSubmit" @reset="submitted = ''">
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Background color</label>
        <input v-bind="api.getHiddenInputProps()" />

        <div v-bind="api.getControlProps()">
          <button v-bind="api.getTriggerProps()">
            <div v-bind="api.getTransparencyGridProps({ size: '10px' })" />
            <div v-bind="api.getSwatchProps({ value: api.value })" />
          </button>
          <input v-bind="api.getChannelInputProps({ channel: 'hex' })" />
        </div>

        <div v-bind="api.getPositionerProps()">
          <div v-bind="api.getContentProps()">
            <div class="content__inner">
              <div v-bind="api.getAreaProps()">
                <div v-bind="api.getAreaBackgroundProps()" />
                <div v-bind="api.getAreaThumbProps()" />
              </div>

              <div v-bind="api.getChannelSliderProps({ channel: 'hue' })">
                <div v-bind="api.getChannelSliderTrackProps({ channel: 'hue' })" />
                <div v-bind="api.getChannelSliderThumbProps({ channel: 'hue' })" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 8px">
        <button type="submit">Submit</button>
        <button type="reset">Reset</button>
      </div>

      <p>
        Submitted: <output aria-label="Submitted value">{{ submitted }}</output>
      </p>
    </form>
  </main>
</template>

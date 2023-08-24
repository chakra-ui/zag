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
  <main class="radio">
    <form>
      <fieldset>
        <div v-bind="api.rootProps">
          <h3 v-bind="api.labelProps">Fruits</h3>

          <label
            v-for="opt in radioData"
            :key="opt.id"
            :data-testid="`radio-${opt.id}`"
            v-bind="api.getRadioProps({ value: opt.id })"
          >
            <div :data-testid="`control-${opt.id}`" v-bind="api.getRadioControlProps({ value: opt.id })" />
            <span :data-testid="`label-${opt.id}`" v-bind="api.getRadioLabelProps({ value: opt.id })">
              {{ opt.label }}
            </span>
            <input :data-testid="`input-${opt.id}`" v-bind="api.getRadioHiddenInputProps({ value: opt.id })" />
          </label>
        </div>

        <button type="reset">Reset</button>
        <button type="button" @click="() => api.setValue('mango')">Set to Mangoes</button>
        <button type="button" @click="() => api.focus()">Focus</button>
        <button type="button" @click="() => api.blur()">Blur</button>
      </fieldset>
    </form>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :config="controls.config" :state="controls.context" />
    </template>
  </Toolbar>
</template>

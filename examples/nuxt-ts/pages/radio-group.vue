<script setup lang="ts">
import * as radio from "@zag-js/radio-group"
import { radioControls, radioData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import serialize from "form-serialize"

const controls = useControls(radioControls)

const [state, send] = useMachine(radio.machine({ id: "1", name: "fruit" }), {
  context: controls.context,
})

const api = computed(() => radio.connect(state.value, send, normalizeProps))
</script>

<template>
  <main class="radio">
    <form
      @change="
        (e) => {
          const result = serialize(e.currentTarget as HTMLFormElement, { hash: true })
          console.log(result)
        }
      "
    >
      <fieldset>
        <div v-bind="api.rootProps">
          <h3 v-bind="api.labelProps">Fruits</h3>
          <div v-bind="api.indicatorProps" />

          <label
            v-for="opt in radioData"
            :key="opt.id"
            :data-testid="`radio-${opt.id}`"
            v-bind="api.getItemProps({ value: opt.id })"
          >
            <div :data-testid="`control-${opt.id}`" v-bind="api.getItemControlProps({ value: opt.id })" />
            <span :data-testid="`label-${opt.id}`" v-bind="api.getItemTextProps({ value: opt.id })">
              {{ opt.label }}
            </span>
            <input :data-testid="`input-${opt.id}`" v-bind="api.getItemHiddenInputProps({ value: opt.id })" />
          </label>
        </div>

        <button type="reset">Reset</button>
        <button type="button" @click="() => api.setValue('mango')">Set to Mangoes</button>
        <button type="button" @click="() => api.focus()">Focus</button>
      </fieldset>
    </form>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

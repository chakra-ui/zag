<script setup lang="ts">
import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/slider.css"

const minBudget = 50

const invalid = ref(false)
const submitted = ref<Record<string, FormDataEntryValue> | null>(null)

const id = useId()
const service = useMachine(
  slider.machine,
  computed(() => ({
    id,
    name: "budget",
    defaultValue: [20],
    thumbSize: 20,
    invalid: invalid.value,
    onValueChange() {
      invalid.value = false
    },
  })),
)

const api = computed(() => slider.connect(service, normalizeProps))

function onSubmit(event: Event) {
  const data = Object.fromEntries(new FormData(event.currentTarget as HTMLFormElement))
  if (Number(data.budget) < minBudget) {
    invalid.value = true
    return
  }
  submitted.value = data
}

function onReset() {
  invalid.value = false
  submitted.value = null
}
</script>

<template>
  <main>
    <form class="vstack gap-4" @submit.prevent="onSubmit" @reset="onReset">
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Budget</label>
        <output v-bind="api.getValueTextProps()">${{ api.value[0] }}</output>
        <div v-bind="api.getControlProps()">
          <div v-bind="api.getTrackProps()">
            <div v-bind="api.getRangeProps()" />
          </div>
          <div v-for="(_, index) in api.value" :key="index" v-bind="api.getThumbProps({ index })">
            <input v-bind="api.getHiddenInputProps({ index })" />
          </div>
        </div>
      </div>
      <p v-if="invalid" class="slider-error">Budget must be at least ${{ minBudget }}</p>
      <div class="hstack">
        <button type="submit">Submit</button>
        <button type="reset">Reset</button>
      </div>
    </form>
    <Output label="Submitted" :value="submitted ?? '—'" />
  </main>
</template>

<script setup lang="ts">
import * as rating from "@zag-js/rating-group"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/rating-group.css"

const value = ref(2)

const id = useId()

const service = useMachine(
  rating.machine,
  computed<rating.Props>(() => ({
    id,
    value: value.value,
    onValueChange(details) {
      value.value = details.value
    },
  })),
)

const api = computed(() => rating.connect(service, normalizeProps))
</script>

<template>
  <main class="rating">
    <div class="vstack gap-4">
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Rate this example</label>
        <div v-bind="api.getControlProps()">
          <span v-for="index in api.items" :key="index" v-bind="api.getItemProps({ index })">
            <Star />
          </span>
        </div>
        <input v-bind="api.getHiddenInputProps()" />
      </div>

      <output>Value: {{ value }}</output>

      <div class="hstack">
        <button type="button" @click="value = 4">Set to 4</button>
        <button type="button" @click="value = 0">Clear</button>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

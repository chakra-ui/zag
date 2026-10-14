<script setup lang="ts">
import * as rating from "@zag-js/rating-group"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { HeartIcon } from "lucide-vue-next"
import "@styles/rating-group.css"

const service = useMachine(rating.machine, {
  id: useId(),
  defaultValue: 3,
})

const api = computed(() => rating.connect(service, normalizeProps))
</script>

<template>
  <main class="rating">
    <div v-bind="api.getRootProps()" :style="{ '--rating-color': 'var(--z-red-500)' }">
      <label v-bind="api.getLabelProps()">How much do you love it?</label>
      <div v-bind="api.getControlProps()">
        <span v-for="index in api.items" :key="index" v-bind="api.getItemProps({ index })">
          <HeartIcon fill="currentColor" :stroke-width="0" />
        </span>
      </div>
      <input v-bind="api.getHiddenInputProps()" />
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

<script setup lang="ts">
import * as rating from "@zag-js/rating-group"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/rating-group.css"

const service = useMachine(rating.machine, {
  id: useId(),
  readOnly: true,
  allowHalf: true,
  defaultValue: 4.5,
})

const api = computed(() => rating.connect(service, normalizeProps))
</script>

<template>
  <main class="rating">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Average rating</label>
      <div class="hstack">
        <div v-bind="api.getControlProps()">
          <span v-for="index in api.items" :key="index" v-bind="api.getItemProps({ index })">
            <HalfStar v-if="api.getItemState({ index }).half" />
            <Star v-else />
          </span>
        </div>
        <span class="rating-summary">
          <strong>{{ api.value }}</strong> · 128 reviews
        </span>
      </div>
      <input v-bind="api.getHiddenInputProps()" />
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

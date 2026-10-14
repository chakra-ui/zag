<script setup lang="ts">
import * as rating from "@zag-js/rating-group"
import { ratingControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/rating-group.css"

const controls = useControls(ratingControls)

const service = useMachine(
  rating.machine,
  controls.mergeProps<rating.Props>({
    id: useId(),
    defaultValue: 2.5,
  }),
)

const api = computed(() => rating.connect(service, normalizeProps))
</script>

<template>
  <main class="rating">
    <form action="" class="vstack gap-4">
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Rate:</label>
        <div v-bind="api.getControlProps()">
          <span v-for="index in api.items" :key="index" v-bind="api.getItemProps({ index })">
            <HalfStar v-if="api.getItemState({ index }).half" />
            <Star v-else />
          </span>
        </div>
        <input v-bind="api.getHiddenInputProps()" data-testid="hidden-input" />
      </div>
      <button type="reset">Reset</button>
    </form>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

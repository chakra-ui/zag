<script setup lang="ts">
import * as rating from "@zag-js/rating-group"
import { ratingControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(ratingControls)

const [state, send] = useMachine(
  rating.machine({
    id: "rating",
    value: 2.5,
  }),
  { context: controls.context },
)

const api = computed(() => rating.connect(state.value, send, normalizeProps))

const items = computed(() =>
  api.value.sizeArray.map((index) => {
    return [index, api.value.getItemState({ index })] as const
  }),
)
</script>

<template>
  <main class="rating">
    <div v-bind="api.rootProps">
      <div v-bind="api.controlProps">
        <span v-for="[index, state] in items" :key="index" v-bind="api.getItemProps({ index })">
          <HalfStar v-if="state.isHalf" />
          <Star v-else="" />
        </span>
      </div>
      <input v-bind="api.hiddenInputProps" data-testid="hidden-input" />
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :config="controls.config" :state="controls.context" />
    </template>
  </Toolbar>
</template>

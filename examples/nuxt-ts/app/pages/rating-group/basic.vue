<script setup lang="ts">
import * as rating from "@zag-js/rating-group"
import { ratingControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(ratingControls)

const service = useMachine(
  rating.machine,
  controls.mergeProps<rating.Props>({
    id: useId(),
    defaultValue: 2.5,
  }),
)

const api = computed(() => rating.connect(service, normalizeProps))

const items = computed(() =>
  api.value.items.map((index) => {
    return [index, api.value.getItemState({ index })] as const
  }),
)
</script>

<template>
  <main class="rating">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getControlProps()">
        <span v-for="[index, state] in items" :key="index" v-bind="api.getItemProps({ index })">
          <HalfStar v-if="state.half" />
          <Star v-else="" />
        </span>
      </div>
      <input v-bind="api.getHiddenInputProps()" data-testid="hidden-input" />
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

<script setup lang="tsx">
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
    return [index, api.value.getRatingState({ index })] as const
  }),
)

const HalfStar = defineComponent({
  name: "HalfStar",
  setup() {
    return () => (
      <svg viewBox="0 0 273 260" data-part="star">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M135.977 214.086L52.1294 259.594L69.6031 165.229L0 99.1561L95.1465 86.614L135.977 1.04785V214.086Z"
          fill="currentColor"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M135.977 213.039L219.826 258.546L202.352 164.181L271.957 98.1082L176.808 85.5661L135.977 0V213.039Z"
          fill="#bdbdbd"
        />
      </svg>
    )
  },
})

const Star = defineComponent({
  name: "Star",
  setup() {
    return () => (
      <svg viewBox="0 0 273 260" data-part="star">
        <path
          d="M136.5 0L177.83 86.614L272.977 99.1561L203.374 165.229L220.847 259.594L136.5 213.815L52.1528 259.594L69.6265 165.229L0.0233917 99.1561L95.1699 86.614L136.5 0Z"
          fill="currentColor"
        />
      </svg>
    )
  },
})
</script>

<template>
  <main class="rating">
    <div v-bind="api.rootProps">
      <div v-bind="api.controlProps">
        <span v-for="[index, state] in items" :key="index" v-bind="api.getRatingProps({ index })">
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

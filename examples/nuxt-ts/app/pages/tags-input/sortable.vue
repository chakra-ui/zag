<script setup lang="ts">
import * as dnd from "@zag-js/dnd"
import * as tagsInput from "@zag-js/tags-input"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/tags-input.css"

const hint = "Drag to reorder, or highlight a tag with the arrow keys and press Alt + Left or Right."

const id = useId()
const value = ref(["Design", "Build", "Test", "Ship"])

const tagsService = useMachine(
  tagsInput.machine,
  computed<tagsInput.Props>(() => ({
    id,
    value: value.value,
    placeholder: "Add step",
    // Keyed by value so the highlight follows a tag when it moves
    ids: { item: ({ value }) => `${id}:tag:${value}` },
    onValueChange: (details) => {
      value.value = details.value
    },
  })),
)
const tagsApi = computed(() => tagsInput.connect(tagsService, normalizeProps))

const dndService = useMachine(dnd.machine, {
  id: useId(),
  orientation: "horizontal",
  activationConstraint: { distance: 4 },
  translations: { instructions: hint },
  onDrop(details) {
    value.value = dnd.reorder(value.value, { ...details, itemToValue: (item) => item })
  },
})
const dndApi = computed(() => dnd.connect(dndService, normalizeProps))

function onInputKeyDown(event: KeyboardEvent) {
  const source = tagsApi.value.highlightedValue
  if (!event.altKey || !source) return
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
  event.preventDefault()
  dndApi.value.move({ value: source, to: event.key === "ArrowLeft" ? "prev" : "next" })
}
</script>

<template>
  <main class="tags-input">
    <div v-bind="tagsApi.getRootProps()">
      <label v-bind="tagsApi.getLabelProps()">Steps</label>
      <div v-bind="dndApi.getRootProps()">
        <div v-bind="tagsApi.getControlProps()">
          <span
            v-for="(value, index) in tagsApi.value"
            :key="value"
            v-bind="
              mergeProps(
                tagsApi.getItemProps({ index, value }),
                dndApi.getDraggableProps({ value }),
                dndApi.getDropTargetProps({ value }),
                { tabindex: -1 },
              )
            "
          >
            <div v-bind="dndApi.getDropIndicatorProps({ value, placement: 'before' })" />
            <div v-bind="tagsApi.getItemPreviewProps({ index, value })">
              <span v-bind="tagsApi.getItemTextProps({ index, value })">{{ value }}</span>
              <button v-bind="tagsApi.getItemDeleteTriggerProps({ index, value })">
                <XIcon />
              </button>
            </div>
            <input v-bind="tagsApi.getItemInputProps({ index, value })" />
            <div v-bind="dndApi.getDropIndicatorProps({ value, placement: 'after' })" />
          </span>
          <input
            v-bind="
              mergeProps(tagsApi.getInputProps(), {
                'aria-describedby': `${id}:hint`,
                onKeydown: onInputKeyDown,
              })
            "
          />
        </div>
      </div>
      <input v-bind="tagsApi.getHiddenInputProps()" />
      <p :id="`${id}:hint`" class="tags-input-hint">{{ hint }}</p>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="tagsService" />
  </Toolbar>
</template>

<script setup lang="ts">
import * as tagsInput from "@zag-js/tags-input"
import { tagsInputControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(tagsInputControls)

function toDashCase(str: string) {
  return str.replace(/\s+/g, "-").toLowerCase()
}

const [state, send] = useMachine(
  tagsInput.machine({
    id: "1",
    value: ["React", "Vue"],
  }),
  { context: controls.context },
)

const api = computed(() => tagsInput.connect(state.value, send, normalizeProps))
</script>

<template>
  <main class="tags-input">
    <div v-bind="api.rootProps">
      <label v-bind="api.labelProps">Enter frameworks:</label>
      <div v-bind="api.controlProps">
        <span v-for="(value, index) in api.value" :key="`${toDashCase(value)}-tag-${index}`">
          <div :data-testid="`${toDashCase(value)}-tag`" v-bind="api.getItemProps({ index, value })">
            <span :data-testid="`${toDashCase(value)}-valuetext`" v-bind="api.getItemTextProps({ index, value })"
              >{{ value }} &nbsp;</span
            >
            <button
              :data-testid="`${toDashCase(value)}-close-button`"
              v-bind="api.getItemDeleteTriggerProps({ index, value })"
            >
              &#x2715;
            </button>
          </div>
          <input :data-testid="`${toDashCase(value)}-input`" v-bind="api.getItemInputProps({ index, value })" />
        </span>

        <input data-testid="input" placeholder="add tag" v-bind="api.inputProps" />
      </div>
      <input v-bind="api.hiddenInputProps" />
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

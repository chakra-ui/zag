<script setup lang="ts">
import * as tagsInput from "@zag-js/tags-input"
import { tagsInputControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(tagsInputControls)

function toDashCase(str: string) {
  return str.replace(/\s+/g, "-").toLowerCase()
}

const service = useMachine(
  tagsInput.machine,
  controls.mergeProps<tagsInput.Props>({
    id: useId(),
    defaultValue: ["React", "Vue"],
  }),
)

const api = computed(() => tagsInput.connect(service, normalizeProps))
</script>

<template>
  <main class="tags-input">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Enter frameworks:</label>
      <div v-bind="api.getControlProps()">
        <span
          v-for="(value, index) in api.value"
          :key="`${toDashCase(value)}-tag-${index}`"
          v-bind="api.getItemProps({ index, value })"
        >
          <div :data-testid="`${toDashCase(value)}-tag`" v-bind="api.getItemPreviewProps({ index, value })">
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

        <input data-testid="input" placeholder="add tag" v-bind="api.getInputProps()" />
      </div>
      <input v-bind="api.getHiddenInputProps()" />
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

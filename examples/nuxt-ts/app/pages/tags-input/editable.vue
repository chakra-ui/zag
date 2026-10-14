<script setup lang="ts">
import { tagsInputControls } from "@zag-js/shared"
import * as tagsInput from "@zag-js/tags-input"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/tags-input.css"

function toDashCase(str: string) {
  return str.replace(/\s+/g, "-").toLowerCase()
}

const controls = useControls(tagsInputControls)

const service = useMachine(
  tagsInput.machine,
  controls.mergeProps<tagsInput.Props>({
    id: useId(),
    editable: true,
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
              >{{ value }}
            </span>
            <button
              :data-testid="`${toDashCase(value)}-close-button`"
              v-bind="api.getItemDeleteTriggerProps({ index, value })"
            >
              <XIcon />
            </button>
          </div>
          <input :data-testid="`${toDashCase(value)}-input`" v-bind="api.getItemInputProps({ index, value })" />
        </span>
        <input data-testid="input" placeholder="add tag" v-bind="api.getInputProps()" />
        <button v-bind="api.getClearTriggerProps()">
          <XIcon />
        </button>
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

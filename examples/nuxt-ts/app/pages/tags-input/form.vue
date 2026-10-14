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

const submitCount = ref(0)
const lastSubmit = ref<string | null>(null)

const service = useMachine(
  tagsInput.machine,
  controls.mergeProps<tagsInput.Props>({
    id: useId(),
    name: "tags",
    defaultValue: ["React", "Vue"],
  }),
)

const api = computed(() => tagsInput.connect(service, normalizeProps))

const onSubmit = (e: Event) => {
  const data = new FormData(e.currentTarget as HTMLFormElement)
  submitCount.value++
  lastSubmit.value = String(data.get("tags") ?? "")
}
</script>

<template>
  <main class="tags-input">
    <form @submit.prevent="onSubmit">
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
          <button type="button" v-bind="api.getClearTriggerProps()">
            <XIcon />
          </button>
        </div>
        <input v-bind="api.getHiddenInputProps()" />
      </div>

      <div style="margin-top: 16px">
        <button type="submit">Submit</button>
      </div>
    </form>

    <section style="margin-top: 16px">
      <strong>submit count:</strong> <span data-testid="submit-count">{{ submitCount }}</span>
      <br />
      <strong>last submitted value:</strong> <span data-testid="last-submit">{{ lastSubmit ?? "—" }}</span>
    </section>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

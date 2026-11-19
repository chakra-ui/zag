<script setup lang="ts">
import * as toggle from "@zag-js/toggle"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-vue-next"
import { useId } from "vue"
import "@styles/toggle.css"

const id = useId()

function useFormat(suffix: string) {
  const service = useMachine(toggle.machine, { id: `${id}-${suffix}` })
  return { service, api: computed(() => toggle.connect(service, normalizeProps)) }
}

const bold = useFormat("bold")
const italic = useFormat("italic")
const underline = useFormat("underline")

const formats = [
  { label: "Bold", Icon: BoldIcon, api: bold.api },
  { label: "Italic", Icon: ItalicIcon, api: italic.api },
  { label: "Underline", Icon: UnderlineIcon, api: underline.api },
]
</script>

<template>
  <main>
    <div class="toggle-text-formatting">
      <p class="hint">Press a format to apply it to the preview.</p>
      <div class="group">
        <button
          v-for="format in formats"
          :key="format.label"
          :aria-label="format.label"
          v-bind="format.api.value.getRootProps()"
        >
          <span v-bind="format.api.value.getIndicatorProps()">
            <component :is="format.Icon" class="icon" />
          </span>
        </button>
      </div>
      <p
        class="preview"
        data-testid="preview"
        :data-bold="bold.api.value.pressed || undefined"
        :data-italic="italic.api.value.pressed || undefined"
        :data-underline="underline.api.value.pressed || undefined"
      >
        The quick brown fox jumps over the lazy dog.
      </p>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="bold.service" />
  </Toolbar>
</template>

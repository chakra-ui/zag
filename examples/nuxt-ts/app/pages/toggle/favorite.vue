<script setup lang="ts">
import * as toggle from "@zag-js/toggle"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { HeartIcon } from "lucide-vue-next"
import { useId } from "vue"
import "@styles/toggle.css"

const id = useId()
const saved = ref(false)

const service = useMachine(
  toggle.machine,
  computed<toggle.Props>(() => ({
    id,
    pressed: saved.value,
    onPressedChange: (pressed) => (saved.value = pressed),
  })),
)
const api = computed(() => toggle.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div class="toggle-favorite">
      <p class="hint">Save the recipe, then use Reset to clear it from outside.</p>
      <div class="row">
        <button aria-label="Save recipe" v-bind="api.getRootProps()">
          <span v-bind="api.getIndicatorProps()">
            <HeartIcon class="icon" />
          </span>
        </button>
        <span class="count" data-testid="saved-count">Saved by {{ saved ? 129 : 128 }} people</span>
      </div>
      <button type="button" @click="saved = false">Reset</button>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

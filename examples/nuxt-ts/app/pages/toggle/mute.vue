<script setup lang="ts">
import * as toggle from "@zag-js/toggle"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { Volume2Icon, VolumeXIcon } from "lucide-vue-next"
import { useId } from "vue"
import "@styles/toggle.css"

const service = useMachine(toggle.machine, { id: useId() })
const api = computed(() => toggle.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div class="toggle-mute">
      <button aria-label="Mute" v-bind="api.getRootProps()">
        <span v-bind="api.getIndicatorProps()">
          <VolumeXIcon v-if="api.pressed" class="icon" />
          <Volume2Icon v-else class="icon" />
        </span>
      </button>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

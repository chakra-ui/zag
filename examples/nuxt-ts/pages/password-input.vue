<script setup lang="ts">
import * as passwordInput from "@zag-js/password-input"
import { passwordInputControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { useId } from "vue"
import { EyeIcon, EyeOffIcon } from "lucide-vue-next"

const controls = useControls(passwordInputControls)

const service = useMachine(passwordInput.machine, controls.mergeProps({ id: useId() }))

const api = computed(() => passwordInput.connect(service, normalizeProps))
</script>

<template>
  <main class="password-input">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Password</label>

      <div v-bind="api.getControlProps()">
        <input v-bind="api.getInputProps()" />
        <button v-bind="api.getVisibilityTriggerProps()">
          <span v-bind="api.getIndicatorProps()">
            <EyeIcon v-if="api.visible" />
            <EyeOffIcon v-else />
          </span>
        </button>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

<script setup lang="ts">
import * as pinInput from "@zag-js/pin-input"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/pin-input.css"

const value = ref(["", "", ""])

const id = useId()

const service = useMachine(
  pinInput.machine,
  computed<pinInput.Props>(() => ({
    id,
    name: "test",
    count: 3,
    value: value.value,
    onValueChange(details) {
      value.value = details.value
    },
  })),
)

const api = computed(() => pinInput.connect(service, normalizeProps))

const onSubmit = () => {
  console.log("submitted:", value.value.join(""))
}
</script>

<template>
  <main class="pin-input">
    <form class="vstack gap-4" @submit.prevent="onSubmit">
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Enter code:</label>
        <div v-bind="api.getControlProps()">
          <input
            v-for="index in api.items"
            :key="index"
            :data-testid="`input-${index + 1}`"
            v-bind="api.getInputProps({ index })"
          />
        </div>
        <input v-bind="api.getHiddenInputProps()" />
      </div>

      <div class="hstack">
        <button type="button" data-testid="clear-button" @click="api.clearValue">Clear</button>
        <button type="button" @click="api.focus">Focus</button>
        <button type="button" data-testid="set-value" @click="value = ['1', '2', '3']">Set 1-2-3</button>
        <button type="button" data-testid="reset-value" @click="value = ['', '', '']">Reset</button>
      </div>
    </form>

    <div style="margin-top: 1rem; padding: 0.5rem; background: #f5f5f5; border-radius: 4px">
      <strong>Controlled value:</strong> [{{ value.map((v) => `"${v}"`).join(", ") }}]
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :context="['value', 'focusedIndex']" />
  </Toolbar>
</template>

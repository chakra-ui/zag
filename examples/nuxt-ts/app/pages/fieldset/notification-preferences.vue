<script setup lang="ts">
import * as fieldsetMachine from "@zag-js/fieldset"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/field.css"
import "@styles/fieldset.css"

const channels = ["Order updates", "Price drops", "Weekly newsletter"]
const selected = ref<string[]>(["Order updates"])

const service = useMachine(fieldsetMachine.machine, { id: useId() })
const api = computed(() => fieldsetMachine.connect(service, normalizeProps))

function onReset() {
  selected.value = ["Order updates"]
}
</script>

<template>
  <main>
    <div class="field-page notification-preferences">
      <form @submit.prevent>
        <fieldset v-bind="api.getRootProps()">
          <legend v-bind="api.getLegendProps()">Email notifications</legend>
          <span v-bind="api.getHelperTextProps()">Choose which emails you would like to receive.</span>
          <label v-for="channel in channels" :key="channel" class="choice">
            <input v-model="selected" type="checkbox" name="notifications" :value="channel" />
            {{ channel }}
          </label>
        </fieldset>
        <div class="actions">
          <button type="button" @click="onReset">Reset</button>
        </div>
      </form>
      <p class="summary" role="status" data-testid="summary">
        {{ selected.length ? `Subscribed to: ${selected.join(", ")}` : "No emails selected" }}
      </p>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

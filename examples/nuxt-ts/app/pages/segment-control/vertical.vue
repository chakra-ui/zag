<script setup lang="ts">
import * as radio from "@zag-js/radio-group"
import { settingsSections } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { useId } from "vue"
import "@styles/segmented-control.css"
import "@styles/radio-group.css"

const service = useMachine(radio.machine, {
  id: useId(),
  name: "section",
  orientation: "vertical",
  defaultValue: "profile",
})

const api = computed(() => radio.connect(service, normalizeProps))
const section = computed(() => settingsSections.find((s) => s.id === api.value.value)!)
</script>

<template>
  <main>
    <div class="segmented-control settings-nav">
      <p class="hint">Use the up and down arrow keys to switch sections.</p>
      <div class="layout">
        <div v-bind="api.getRootProps()">
          <span v-bind="api.getLabelProps()">Settings section</span>
          <div v-bind="api.getIndicatorProps()" />
          <label v-for="opt in settingsSections" :key="opt.id" v-bind="api.getItemProps({ value: opt.id })">
            <span v-bind="api.getItemTextProps({ value: opt.id })">{{ opt.label }}</span>
            <input v-bind="api.getItemHiddenInputProps({ value: opt.id })" />
          </label>
        </div>
        <div class="panel" role="region" :aria-label="section.label">
          <p class="title">{{ section.label }}</p>
          <p class="description">{{ section.description }}</p>
        </div>
      </div>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

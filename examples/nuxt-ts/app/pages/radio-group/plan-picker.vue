<script setup lang="ts">
import * as radio from "@zag-js/radio-group"
import { planOptions } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { useId } from "vue"
import "@styles/radio-group.css"

const id = useId()
const value = ref<string | null>("free")

const service = useMachine(
  radio.machine,
  computed<radio.Props>(() => ({
    id,
    name: "plan",
    value: value.value,
    onValueChange: (details) => {
      value.value = details.value
    },
  })),
)

const api = computed(() => radio.connect(service, normalizeProps))
const selected = computed(() => planOptions.find((plan) => plan.id === value.value))
</script>

<template>
  <main>
    <div class="plan-picker">
      <p class="hint">Pick a plan, or use the button to switch to Team.</p>
      <div v-bind="api.getRootProps()">
        <span v-bind="api.getLabelProps()">Plan</span>
        <label
          v-for="opt in planOptions"
          :key="opt.id"
          :data-testid="`radio-${opt.id}`"
          v-bind="api.getItemProps({ value: opt.id, disabled: opt.disabled })"
        >
          <div v-bind="api.getItemControlProps({ value: opt.id, disabled: opt.disabled })" />
          <span v-bind="api.getItemTextProps({ value: opt.id, disabled: opt.disabled })">
            <span class="name">{{ opt.label }}</span>
            <span class="price">{{ opt.price }}</span>
            <span class="detail">{{ opt.note }}</span>
          </span>
          <input v-bind="api.getItemHiddenInputProps({ value: opt.id, disabled: opt.disabled })" />
        </label>
      </div>
      <p class="selected" data-testid="selected-plan" role="status">Selected plan: {{ selected?.label ?? "None" }}</p>
      <div class="actions">
        <button type="button" @click="value = 'team'">Switch to Team</button>
      </div>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

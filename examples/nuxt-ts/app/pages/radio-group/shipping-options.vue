<script setup lang="ts">
import * as radio from "@zag-js/radio-group"
import { shippingOptions } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { useId } from "vue"
import "@styles/radio-group.css"

const service = useMachine(radio.machine, {
  id: useId(),
  name: "shipping",
  defaultValue: "standard",
})

const api = computed(() => radio.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div class="shipping-options">
      <p class="hint">Focus a method and use the arrow keys to switch.</p>
      <div v-bind="api.getRootProps()">
        <span v-bind="api.getLabelProps()">Shipping method</span>
        <label
          v-for="opt in shippingOptions"
          :key="opt.id"
          :data-testid="`radio-${opt.id}`"
          v-bind="api.getItemProps({ value: opt.id })"
        >
          <div v-bind="api.getItemControlProps({ value: opt.id })" />
          <span v-bind="api.getItemTextProps({ value: opt.id })">
            <span class="name">{{ opt.label }}</span>
            <span class="price">{{ opt.price }}</span>
            <span class="detail">{{ opt.delivery }}</span>
          </span>
          <input v-bind="api.getItemHiddenInputProps({ value: opt.id })" />
        </label>
      </div>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

<script lang="ts" setup>
import * as toast from "@zag-js/toast"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/toast.css"

const toaster = toast.createStore({ placement: "bottom-end", duration: Infinity })

const variants: Array<{ label: string; swipeDirections?: toast.SwipeDirection[] }> = [
  { label: "Default" },
  { label: "Right", swipeDirections: ["right"] },
  { label: "Up and right", swipeDirections: ["up", "right"] },
  { label: "Left and right", swipeDirections: ["left", "right"] },
  { label: "Up and down", swipeDirections: ["up", "down"] },
  { label: "No swipe", swipeDirections: [] },
]

const service = useMachine(toast.group.machine, { id: useId(), store: toaster })
const api = computed(() => toast.group.connect(service, normalizeProps))

const show = (label: string, swipeDirections?: toast.SwipeDirection[]) =>
  toaster.create({ title: `Swipe: ${label}`, description: "Drag to dismiss", swipeDirections })
</script>

<template>
  <main>
    <div class="hstack">
      <button v-for="variant in variants" :key="variant.label" @click="show(variant.label, variant.swipeDirections)">
        {{ variant.label }}
      </button>
    </div>
    <Teleport to="#teleports">
      <div v-bind="api.getGroupProps()">
        <ToastItem
          v-for="(actor, index) in api.getToasts()"
          :key="actor.id"
          :actor="actor"
          :index="index"
          :parent="service"
        />
      </div>
    </Teleport>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

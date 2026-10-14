<script setup lang="ts">
import * as tour from "@zag-js/tour"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { X } from "lucide-vue-next"
import "@styles/tour.css"

const steps: tour.StepDetails[] = [
  {
    id: "dialog-intro",
    type: "dialog",
    title: "Dialog Step",
    description: "This is a centered dialog step with no target element.",
    actions: [{ label: "Next", action: "next" }],
  },
  {
    id: "tooltip-feature",
    type: "tooltip",
    target: () => document.querySelector<HTMLElement>("#feature-btn"),
    title: "Tooltip Step",
    description: "This tooltip points to a specific element on the page.",
    placement: "bottom",
    actions: [
      { label: "Prev", action: "prev" },
      { label: "Next", action: "next" },
    ],
  },
  {
    id: "wait-action",
    type: "wait",
    title: "",
    description: "",
    effect({ next }) {
      const btn = document.querySelector<HTMLElement>("#continue-btn")
      if (!btn) return
      const handler = () => next()
      btn.addEventListener("click", handler, { once: true })
      return () => btn.removeEventListener("click", handler)
    },
  },
  {
    id: "tooltip-after-wait",
    type: "tooltip",
    target: () => document.querySelector<HTMLElement>("#continue-btn"),
    title: "Back to Tooltip",
    description: "After the wait step, we're back to a tooltip. Placement styles should be clean.",
    placement: "top",
    actions: [{ label: "Next", action: "next" }],
  },
  {
    id: "dialog-after-tooltip",
    type: "dialog",
    title: "Dialog After Tooltip",
    description: "Switching back to dialog. Old tooltip positioning styles should be fully cleaned up.",
    actions: [{ label: "Next", action: "next" }],
  },
  {
    id: "floating-end",
    type: "floating",
    title: "Floating Step",
    description: "A floating step with no backdrop or arrow.",
    actions: [{ label: "Done", action: "dismiss" }],
  },
]

const service = useMachine(tour.machine, {
  id: useId(),
  steps,
})

const api = computed(() => tour.connect(service, normalizeProps))
</script>

<template>
  <main class="tour">
    <div>
      <button @click="api.start()">Start Tour</button>
      <div class="steps__container">
        <button id="feature-btn">Feature Button</button>
        <button id="continue-btn">Continue</button>
        <p v-if="api.step?.type === 'wait'">Click "Continue" to proceed...</p>
      </div>
    </div>

    <Teleport v-if="api.step && api.open" to="#teleports">
      <div v-if="api.step.backdrop" v-bind="api.getBackdropProps()" />
      <div v-bind="api.getSpotlightProps()" />
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <div v-if="api.step.arrow" v-bind="api.getArrowProps()">
            <div v-bind="api.getArrowTipProps()" />
          </div>

          <p v-bind="api.getTitleProps()">{{ api.step.title }}</p>
          <div v-bind="api.getDescriptionProps()">{{ api.step.description }}</div>
          <div v-bind="api.getProgressTextProps()">{{ api.getProgressText() }}</div>

          <div v-if="api.step.actions" class="tour button__group">
            <button
              v-for="action in api.step.actions"
              :key="action.label"
              v-bind="api.getActionTriggerProps({ action })"
            >
              {{ action.label }}
            </button>
          </div>

          <button v-bind="api.getCloseTriggerProps()">
            <X />
          </button>
        </div>
      </div>
    </Teleport>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" :omit="['steps']" />
  </Toolbar>
</template>

<script setup lang="ts">
import * as tour from "@zag-js/tour"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/tour.css"

const steps: tour.StepDetails[] = [
  {
    type: "dialog",
    id: "start",
    title: "Welcome",
    description: "This tour waits for you to type a value before moving forward.",
    actions: [{ label: "Let's go!", action: "next" }],
  },
  {
    id: "input",
    title: "Type something",
    description: 'Type "test" in the input field to continue to the next step.',
    target: () => document.querySelector("[data-id=input]"),
    placement: "bottom",
    effect({ next, show }) {
      show()
      const [promise, cleanup] = tour.waitForElementValue(
        () => document.querySelector("[data-id=input] input"),
        "test",
        {
          timeout: 10000,
        },
      )
      promise
        .then(() => {
          cleanup()
          next()
        })
        .catch(() => {})
      return cleanup
    },
  },
  {
    id: "result",
    title: "Result",
    description: "Great! You typed the correct value. Here's where your result would appear.",
    target: () => document.querySelector("[data-id=result]"),
    placement: "bottom",
    actions: [
      { label: "Previous", action: "previous" },
      { label: "Next", action: "next" },
    ],
  },
  {
    type: "dialog",
    id: "end",
    title: "All done!",
    description: "You've completed the input event tour.",
    actions: [{ label: "Finish", action: "dismiss" }],
  },
]

const service = useMachine(tour.machine, {
  id: useId(),
  steps,
})

const api = computed(() => tour.connect(service, normalizeProps))
</script>

<template>
  <main>
    <button class="tour-trigger" @click="api.start()">Start Tour</button>

    <div data-id="result" style="padding: 20px">
      <h3>Result</h3>
      <p>Your input will appear here after the tour.</p>
    </div>

    <div data-id="input" style="padding: 20px">
      <input type="text" placeholder='Type "test" to continue...' style="border: 1px solid black; padding: 10px" />
    </div>

    <Teleport v-if="api.step && api.open" to="#teleports">
      <div v-if="api.step.backdrop" v-bind="api.getBackdropProps()" />
      <div v-bind="api.getSpotlightProps()" />
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <button v-bind="api.getCloseTriggerProps()">
            <XIcon />
          </button>

          <div v-if="api.step.arrow" v-bind="api.getArrowProps()">
            <div v-bind="api.getArrowTipProps()" />
          </div>

          <div v-bind="api.getProgressTextProps()">{{ api.getProgressText() }}</div>

          <p v-bind="api.getTitleProps()">{{ api.step.title }}</p>
          <div v-bind="api.getDescriptionProps()">{{ api.step.description }}</div>

          <div v-if="api.step.actions" style="display: flex; gap: 5px">
            <button
              v-for="action in api.step.actions"
              :key="action.label"
              v-bind="api.getActionTriggerProps({ action })"
            >
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </main>
</template>

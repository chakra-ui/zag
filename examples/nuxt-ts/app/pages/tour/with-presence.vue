<script setup lang="ts">
import { tourControls } from "@zag-js/shared"
import * as tour from "@zag-js/tour"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { X } from "lucide-vue-next"
import "@styles/tour.css"

const steps: tour.StepDetails[] = [
  {
    type: "dialog",
    id: "intro",
    title: "Welcome",
    description: "This tour uses Presence so content stays mounted during the exit animation.",
    actions: [{ label: "Next", action: "next" }],
  },
  {
    type: "tooltip",
    id: "search",
    title: "Search",
    description: "Find anything from here.",
    target: () => document.querySelector<HTMLElement>("#tour-search"),
    actions: [
      { label: "Prev", action: "prev" },
      { label: "Next", action: "next" },
    ],
  },
  {
    type: "tooltip",
    id: "profile",
    title: "Profile",
    description: "Finish here to watch the tooltip exit animation.",
    target: () => document.querySelector<HTMLElement>("#tour-profile"),
    actions: [
      { label: "Prev", action: "prev" },
      { label: "Finish", action: "dismiss" },
    ],
  },
]

const controls = useControls(tourControls)

const service = useMachine(
  tour.machine,
  controls.mergeProps<tour.Props>({
    id: useId(),
    steps,
  }),
)

const api = computed(() => tour.connect(service, normalizeProps))
</script>

<template>
  <main class="tour">
    <div>
      <button @click="api.start()">Start Tour</button>
      <pre data-testid="tour-debug" style="margin-top: 12px; font-size: 12px">
open={{ String(api.open) }} stepId={{ api.step?.id ?? "null" }} title={{ api.step?.title ?? "(empty)" }}</pre>
      <div style="display: flex; gap: 16px; margin-top: 24px">
        <button id="tour-search" type="button">Search</button>
        <button id="tour-profile" type="button">Profile</button>
      </div>
    </div>

    <Teleport to="#teleports">
      <Presence v-bind="api.getBackdropProps()" lazy-mount unmount-on-exit />
      <Presence v-bind="api.getSpotlightProps()" lazy-mount unmount-on-exit />
      <div v-bind="api.getPositionerProps()">
        <Presence v-bind="api.getContentProps()" lazy-mount unmount-on-exit>
          <template v-if="api.step">
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
          </template>
          <p v-else data-testid="step-cleared-during-exit" style="color: crimson; font-weight: 700">
            STEP CLEARED DURING EXIT (bug)
          </p>
        </Presence>
      </div>
    </Teleport>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :omit="['steps']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

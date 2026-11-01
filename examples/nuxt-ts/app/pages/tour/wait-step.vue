<script setup lang="ts">
import { tourControls } from "@zag-js/shared"
import * as tour from "@zag-js/tour"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { X } from "lucide-vue-next"
import "@styles/tour.css"

const steps: tour.StepDetails[] = [
  {
    id: "intro",
    type: "dialog",
    title: "Welcome to Luna Music",
    description: "Let's take a quick tour! You'll learn how to play, like, and share your favorite tracks.",
    actions: [{ label: "Start", action: "next" }],
  },
  {
    id: "play-step",
    type: "tooltip",
    target: () => document.querySelector<HTMLElement>("#play-btn"),
    title: "Step 1: Play the Song",
    description: "Scroll down to the player section and click the Play button to start the music 🎵",
    placement: "top",
    actions: [{ label: "Next", action: "next" }],
  },
  {
    id: "wait-step",
    type: "wait",
    title: "Wait Step",
    description: "Wait for 2 seconds",
    effect({ next }) {
      document.querySelector<HTMLElement>("#play-btn")?.addEventListener("click", next, { once: true })
    },
  },
  {
    id: "like-step",
    type: "tooltip",
    target: () => document.querySelector<HTMLElement>("#like-btn"),
    title: "Step 2: Like the Song",
    description: "Click the heart ❤️ to save it to your Liked Songs.",
    placement: "top",
    effect({ show, next, target }) {
      show()
      const btn = target?.()
      if (!btn) return
      const handler = () => next()
      btn.addEventListener("click", handler)
      return () => btn.removeEventListener("click", handler)
    },
  },
  {
    id: "final",
    type: "dialog",
    title: "You're All Set!",
    description: "You've just learned the basics of Luna Music. Time to enjoy your tunes!",
    actions: [{ label: "Finish", action: "dismiss" }],
  },
]

const controls = useControls(tourControls)

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
        <h2>Luna Music Player</h2>
        <div class="player__section">
          <div class="player__controls">
            <button id="play-btn" class="control-btn">▶️ Play</button>
            <button id="like-btn" class="control-btn">❤️ Like</button>
            <button id="share-btn" class="control-btn">🎧 Share</button>
          </div>
        </div>
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
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

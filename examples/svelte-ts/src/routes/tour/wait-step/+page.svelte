<script lang="ts">
  import Portal from "#lib/components/portal.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import { useControls } from "#lib/use-controls.svelte.ts"
  import { tourControls } from "@zag-js/shared"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import * as tour from "@zag-js/tour"
  import { XIcon } from "lucide-svelte"
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

  const id = $props.id()
  const service = useMachine(tour.machine, { id, steps })

  const api = $derived(tour.connect(service, normalizeProps))
</script>

<main class="tour">
  <div>
    <button onclick={() => api.start()}>Start Tour</button>
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

  {#if api.step && api.open}
    <Portal>
      {#if api.step.backdrop}
        <div {...api.getBackdropProps()}></div>
      {/if}
      <div {...api.getSpotlightProps()}></div>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          {#if api.step.arrow}
            <div {...api.getArrowProps()}>
              <div {...api.getArrowTipProps()}></div>
            </div>
          {/if}

          <p {...api.getTitleProps()}>{api.step.title}</p>
          <div {...api.getDescriptionProps()}>{api.step.description}</div>
          <div {...api.getProgressTextProps()}>{api.getProgressText()}</div>

          {#if api.step.actions}
            <div class="tour button__group">
              {#each api.step.actions as action (action.label)}
                <button {...api.getActionTriggerProps({ action })}>{action.label}</button>
              {/each}
            </div>
          {/if}

          <button {...api.getCloseTriggerProps()}>
            <XIcon />
          </button>
        </div>
      </div>
    </Portal>
  {/if}
</main>

<Toolbar {controls} viz>
  <StateVisualizer state={service} omit={["steps"]} />
</Toolbar>

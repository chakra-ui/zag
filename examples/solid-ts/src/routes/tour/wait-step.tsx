import { tourControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tour from "@zag-js/tour"
import { X } from "lucide-solid"
import { For, Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
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
      const btn = document.querySelector<HTMLElement>("#play-btn")
      btn?.addEventListener("click", next, { once: true })
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

export default function Page() {
  const controls = useControls(tourControls)

  const service = useMachine(tour.machine, {
    id: createUniqueId(),
    steps,
  })

  const api = createMemo(() => tour.connect(service, normalizeProps))

  return (
    <>
      <main class="tour">
        <div>
          <button onClick={() => api().start()}>Start Tour</button>
          <div class="steps__container">
            <h2>Luna Music Player</h2>
            <div class="player__section">
              <div class="player__controls">
                <button id="play-btn" class="control-btn">
                  ▶️ Play
                </button>
                <button id="like-btn" class="control-btn">
                  ❤️ Like
                </button>
                <button id="share-btn" class="control-btn">
                  🎧 Share
                </button>
              </div>
            </div>
          </div>
        </div>

        <Show when={api().step && api().open}>
          <Portal>
            <Show when={api().step?.backdrop}>
              <div {...api().getBackdropProps()} />
            </Show>
            <div {...api().getSpotlightProps()} />
            <div {...api().getPositionerProps()}>
              <div {...api().getContentProps()}>
                <Show when={api().step?.arrow}>
                  <div {...api().getArrowProps()}>
                    <div {...api().getArrowTipProps()} />
                  </div>
                </Show>

                <p {...api().getTitleProps()}>{api().step?.title}</p>
                <div {...api().getDescriptionProps()}>{api().step?.description}</div>
                <div {...api().getProgressTextProps()}>{api().getProgressText()}</div>

                <Show when={api().step?.actions}>
                  {(actions) => (
                    <div class="tour button__group">
                      <For each={actions()}>
                        {(action) => <button {...api().getActionTriggerProps({ action })}>{action.label}</button>}
                      </For>
                    </div>
                  )}
                </Show>

                <button {...api().getCloseTriggerProps()}>
                  <X />
                </button>
              </div>
            </div>
          </Portal>
        </Show>
      </main>

      <Toolbar controls={controls} viz>
        <StateVisualizer state={service} omit={["steps"]} />
      </Toolbar>
    </>
  )
}

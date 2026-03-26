import styles from "../../../../shared/src/css/tour.module.css"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { tourControls } from "@zag-js/shared"
import * as tour from "@zag-js/tour"
import { X } from "lucide-react"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

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
      btn.addEventListener("click", next, { once: true })
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
      const btn = target()
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
    id: useId(),
    steps,

    // ...controls.context,
  })

  const api = tour.connect(service, normalizeProps)

  return (
    <>
      <main className="tour">
        <div>
          <button onClick={() => api.start()}>Start Tour</button>
          <div className="steps__container">
            <h2>Luna Music Player</h2>
            <div className="player__section">
              <div className="player__controls">
                <button id="play-btn" className="control-btn">
                  ▶️ Play
                </button>
                <button id="like-btn" className="control-btn">
                  ❤️ Like
                </button>
                <button id="share-btn" className="control-btn">
                  🎧 Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {api.step && api.open && (
          <Portal>
            {api.step.backdrop && <div {...api.getBackdropProps()} className={styles.Backdrop} />}
            <div {...api.getSpotlightProps()} className={styles.Spotlight} />
            <div {...api.getPositionerProps()} className={styles.Positioner}>
              <div {...api.getContentProps()} className={styles.Content}>
                {api.step.arrow && (
                  <div {...api.getArrowProps()} className={styles.Arrow}>
                    <div {...api.getArrowTipProps()} />
                  </div>
                )}

                <p {...api.getTitleProps()} className={styles.Title}>{api.step.title}</p>
                <div {...api.getDescriptionProps()} className={styles.Description}>{api.step.description}</div>
                <div {...api.getProgressTextProps()} className={styles.ProgressText}>{api.getProgressText()}</div>

                {api.step.actions && (
                  <div className="tour button__group">
                    {api.step.actions.map((action) => (
                      <button key={action.label} {...api.getActionTriggerProps({ action })}>
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}

                <button {...api.getCloseTriggerProps()} className={styles.CloseTrigger}>
                  <X />
                </button>
              </div>
            </div>
          </Portal>
        )}
      </main>

      <Toolbar controls={controls.ui} viz>
        <StateVisualizer state={service} omit={["steps"]} />
      </Toolbar>
    </>
  )
}

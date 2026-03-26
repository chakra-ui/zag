import styles from "../../../../shared/src/css/tour.module.css"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import * as tour from "@zag-js/tour"
import { X } from "lucide-react"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

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

export default function Page() {
  const service = useMachine(tour.machine, {
    id: useId(),
    steps,
  })

  const api = tour.connect(service, normalizeProps)

  return (
    <>
      <main className="tour">
        <div>
          <button onClick={() => api.start()}>Start Tour</button>
          <div className="steps__container">
            <button id="feature-btn">Feature Button</button>
            <button id="continue-btn">Continue</button>
            {api.step?.type === "wait" && <p>Click "Continue" to proceed...</p>}
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

      <Toolbar viz>
        <StateVisualizer state={service} omit={["steps"]} />
      </Toolbar>
    </>
  )
}

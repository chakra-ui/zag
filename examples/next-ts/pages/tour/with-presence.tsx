import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { tourControls } from "@zag-js/shared"
import * as tour from "@zag-js/tour"
import { X } from "lucide-react"
import { useId } from "react"
import { Presence } from "../../components/presence"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

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

export default function Page() {
  const controls = useControls(tourControls)

  const service = useMachine(tour.machine, {
    id: useId(),
    steps,
    ...controls.context,
  })

  const api = tour.connect(service, normalizeProps)

  return (
    <>
      <main className="tour">
        <div>
          <button onClick={() => api.start()}>Start Tour</button>
          <pre data-testid="tour-debug" style={{ marginTop: 12, fontSize: 12 }}>
            open={String(api.open)} stepId={api.step?.id ?? "null"} title={api.step?.title ?? "(empty)"}
          </pre>
          <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
            <button id="tour-search" type="button">
              Search
            </button>
            <button id="tour-profile" type="button">
              Profile
            </button>
          </div>
        </div>

        <Portal>
          <Presence {...api.getBackdropProps()} lazyMount unmountOnExit />
          <Presence {...api.getSpotlightProps()} lazyMount unmountOnExit />
          <div {...api.getPositionerProps()}>
            <Presence {...api.getContentProps()} lazyMount unmountOnExit>
              {api.step ? (
                <>
                  {api.step.arrow && (
                    <div {...api.getArrowProps()}>
                      <div {...api.getArrowTipProps()} />
                    </div>
                  )}

                  <p {...api.getTitleProps()}>{api.step.title}</p>
                  <div {...api.getDescriptionProps()}>{api.step.description}</div>
                  <div {...api.getProgressTextProps()}>{api.getProgressText()}</div>

                  {api.step.actions && (
                    <div className="tour button__group">
                      {api.step.actions.map((action) => (
                        <button key={action.label} {...api.getActionTriggerProps({ action })}>
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <button {...api.getCloseTriggerProps()}>
                    <X />
                  </button>
                </>
              ) : (
                <p data-testid="step-cleared-during-exit" style={{ color: "crimson", fontWeight: 700 }}>
                  STEP CLEARED DURING EXIT (bug)
                </p>
              )}
            </Presence>
          </div>
        </Portal>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} omit={["steps"]} />
      </Toolbar>
    </>
  )
}

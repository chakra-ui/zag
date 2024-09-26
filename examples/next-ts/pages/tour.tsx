import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { tourControls } from "@zag-js/shared"
import * as tour from "@zag-js/tour"
import { X } from "lucide-react"
import { useId } from "react"
import { IFrame } from "../components/iframe"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

const steps: tour.StepDetails[] = [
  {
    type: "floating",
    placement: "bottom-end",
    id: "step-0",
    title: "Step 1. Controls",
    description: "Use them to change the context properties",
    actions: [{ label: "Show me the tour", action: "next" }],
  },
  {
    type: "tooltip",
    // backdrop: false,
    id: "step-1",
    title: "Step 1. Controls",
    description: "Use them to change the context properties",
    // target: () => document.querySelector<HTMLElement>(".toolbar nav button:nth-child(1)"),
    target: () => document.querySelector<HTMLElement>("#step-1"),
    actions: [
      { label: "Prev", action: "prev" },
      { label: "Next", action: "next" },
    ],
  },
  {
    type: "wait",
    id: "step-xx",
    title: "Step xx",
    description: "Wait for 2 seconds",
    effect({ show, next }) {
      show()
      let timer = setTimeout(next, 5000)
      return () => clearTimeout(timer)
    },
  },
  {
    type: "tooltip",
    id: "step-2",
    title: "Step 2. Visualizer",
    description: "Use them to see the state of the tour. Click the Visualizer button to proceed.",
    target: () => document.querySelector<HTMLElement>(".toolbar nav button:nth-child(2)"),
    actions: [
      { label: "Prev", action: "prev" },
      { label: "Next", action: "next" },
    ],
  },
  {
    type: "tooltip",
    id: "step-4",
    title: "Step 4. Close",
    description: "Here's the context information",
    target: () => document.querySelector<HTMLElement>(".toolbar [data-content][data-active]"),
    placement: "left-start",
    actions: [{ label: "Finish", action: "dismiss" }],
  },
]

export default function Page() {
  const controls = useControls(tourControls)

  const [state, send] = useMachine(
    tour.machine({
      id: useId(),
      steps,
      // steps: tourData,
    }),
    {
      // context: controls.context,
    },
  )

  const api = tour.connect(state, send, normalizeProps)

  return (
    <>
      <main className="tour">
        <div>
          <button onClick={() => api.start()}>Start Tour</button>
          <div className="steps__container">
            <h3 id="step-1">Step 1</h3>
            <div className="overflow__container">
              <div className="h-200px" />
              <h3 id="step-2">Step 2</h3>
              <div className="h-100px" />
            </div>
            <IFrame>
              <h1 id="step-2a">Iframe Content</h1>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </p>
            </IFrame>
            <h3 id="step-3">Step 3</h3>
            <h3 id="step-4">Step 4</h3>
          </div>
        </div>

        {api.currentStep && api.open && (
          <Portal>
            {api.currentStep.backdrop && <div {...api.getBackdropProps()} />}
            <div {...api.getSpotlightProps()} />
            <div {...api.getPositionerProps()}>
              <div {...api.getContentProps()}>
                {api.currentStep.arrow && (
                  <div {...api.getArrowProps()}>
                    <div {...api.getArrowTipProps()} />
                  </div>
                )}

                <p {...api.getTitleProps()}>{api.currentStep.title}</p>
                <div {...api.getDescriptionProps()}>{api.currentStep.description}</div>
                <div {...api.getProgressTextProps()}>{api.getProgressText()}</div>

                {api.currentStep.actions && (
                  <div className="tour button__group">
                    {api.currentStep.actions.map((action) => (
                      <button key={action.label} {...api.getActionTriggerProps({ action })}>
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}

                <button {...api.getCloseTriggerProps()}>
                  <X />
                </button>
              </div>
            </div>
          </Portal>
        )}
      </main>

      <Toolbar controls={controls.ui} viz>
        <StateVisualizer state={state} omit={["steps"]} />
      </Toolbar>
    </>
  )
}

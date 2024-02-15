import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { tourControls, tourData } from "@zag-js/shared"
import * as tour from "@zag-js/tour"
import { useId } from "react"
import { IFrame } from "../components/iframe"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(tourControls)

  const [state, send] = useMachine(
    tour.machine({
      id: useId(),
      steps: tourData,
    }),
    {
      context: controls.context,
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

        <Portal>
          <div {...api.overlayProps} />
          <div {...api.spotlightProps} />
          <div {...api.positionerProps}>
            {api.currentStep && (
              <div {...api.contentProps}>
                <div {...api.arrowProps}>
                  <div {...api.arrowTipProps} />
                </div>
                <p {...api.titleProps}>{api.currentStep.title}</p>
                <div {...api.descriptionProps}>{api.currentStep.description}</div>

                <div className="tour button__group">
                  <button {...api.prevTriggerProps}>Prev</button>
                  <button {...api.nextTriggerProps}>Next</button>
                  {api.isLastStep && (
                    <button {...api.closeTriggerProps} style={{ marginLeft: "auto" }}>
                      Close
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Portal>
      </main>

      <Toolbar controls={controls.ui} viz>
        <StateVisualizer state={state} omit={["steps"]} />
      </Toolbar>
    </>
  )
}

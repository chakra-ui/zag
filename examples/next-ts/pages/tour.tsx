import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { tourControls, tourData } from "@zag-js/shared"
import * as tour from "@zag-js/tour"
import { X } from "lucide-react"
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

        {api.step && api.open && (
          <Portal>
            {api.step.backdrop && <div {...api.getBackdropProps()} />}
            <div {...api.getSpotlightProps()} />
            <div {...api.getPositionerProps()}>
              <div {...api.getContentProps()}>
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
              </div>
            </div>
          </Portal>
        )}
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} omit={["steps"]} />
      </Toolbar>
    </>
  )
}

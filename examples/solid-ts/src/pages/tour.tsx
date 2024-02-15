import * as tour from "@zag-js/tour"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Show, createMemo, createUniqueId } from "solid-js"
import { tourControls, tourData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"
import { Portal } from "solid-js/web"

export default function Page() {
  const controls = useControls(tourControls)

  const [state, send] = useMachine(tour.machine({ id: createUniqueId(), steps: tourData }), {
    context: controls.context,
  })

  const api = createMemo(() => tour.connect(state, send, normalizeProps))

  return (
    <>
      <main class="tour">
        <div>
          <button onClick={api().start}>Start Tour</button>
          <div class="steps__container">
            <h3 id="step-1">Step 1</h3>
            <div class="overflow__container">
              <div class="h-200px" />
              <h3 id="step-2">Step 2</h3>
              <div class="h-100px" />
            </div>
            <h3 id="step-3">Step 3</h3>
            <h3 id="step-4">Step 4</h3>
          </div>
        </div>

        <Portal>
          <div {...api().overlayProps} />
          <div {...api().strokeProps} />
          <div {...api().positionerProps}>
            <Show when={api().currentStep}>
              <div {...api().contentProps}>
                <div {...api().arrowProps}>
                  <div {...api().arrowTipProps} />
                </div>
                <p {...api().titleProps}>{api().currentStep!.title}</p>
                <div {...api().descriptionProps}>{api().currentStep!.description}</div>

                <div class="tour button__group">
                  <button {...api().prevTriggerProps}>Prev</button>
                  <button {...api().nextTriggerProps}>Next</button>
                  {api().isLastStep && (
                    <button {...api().closeTriggerProps} style={{ "margin-left": "auto" }}>
                      Close
                    </button>
                  )}
                </div>
              </div>
            </Show>
          </div>
        </Portal>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} omit={["steps"]} />
      </Toolbar>
    </>
  )
}

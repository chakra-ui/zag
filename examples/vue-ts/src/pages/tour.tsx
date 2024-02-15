import * as tour from "@zag-js/tour"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment, Teleport } from "vue"
import { tourControls, tourData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "tour",
  setup() {
    const controls = useControls(tourControls)

    const [state, send] = useMachine(tour.machine({ id: "1", steps: tourData }), {
      context: controls.context,
    })

    const apiRef = computed(() => tour.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="tour">
            <div>
              <button onClick={api.start}>Start Tour</button>
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

            <Teleport to="body">
              <div {...api.overlayProps} />
              <div {...api.strokeProps} />
              <div {...api.positionerProps}>
                {api.currentStep && (
                  <div {...api.contentProps}>
                    <div {...api.arrowProps}>
                      <div {...api.arrowTipProps} />
                    </div>
                    <p {...api.titleProps}>{api.currentStep.title}</p>
                    <div {...api.descriptionProps}>{api.currentStep.description}</div>

                    <div class="tour button__group">
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
            </Teleport>
          </main>

          <Toolbar controls={controls.ui}>
            <StateVisualizer state={state} omit={["steps"]} />
          </Toolbar>
        </>
      )
    }
  },
})

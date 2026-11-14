import { Portal, normalizeProps, useMachine } from "@zag-js/preact"
import { tourLateTargetData } from "@zag-js/shared"
import * as tour from "@zag-js/tour"
import { X } from "lucide-preact"
import { useId, useState } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/tour.css"

export default function Page() {
  const [shown, setShown] = useState(false)

  const service = useMachine(tour.machine, { id: useId(), steps: tourLateTargetData, targetTimeout: 5000 })
  const api = tour.connect(service, normalizeProps)

  return (
    <>
      <main className="tour">
        <div>
          <button onClick={() => api.start()}>Start Tour</button>
          <button onClick={() => setShown(true)}>Show target</button>

          <div className="steps__container">{shown && <h3 id="late-target">Target</h3>}</div>
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

                <div className="tour button__group">
                  {api.step.actions?.map((action) => (
                    <button key={action.label} {...api.getActionTriggerProps({ action })}>
                      {action.label}
                    </button>
                  ))}
                </div>

                <button {...api.getCloseTriggerProps()}>
                  <X />
                </button>
              </div>
            </div>
          </Portal>
        )}
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

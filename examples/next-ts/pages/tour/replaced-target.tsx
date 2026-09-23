import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { tourReplacedTargetData } from "@zag-js/shared"
import * as tour from "@zag-js/tour"
import { X } from "lucide-react"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default function Page() {
  const [replaced, setReplaced] = useState(false)

  const service = useMachine(tour.machine, { id: useId(), steps: tourReplacedTargetData })
  const api = tour.connect(service, normalizeProps)

  return (
    <>
      <main className="tour">
        <div>
          <button onClick={() => api.start()}>Start Tour</button>
          <button onClick={() => setReplaced(true)}>Replace target</button>

          <div className="steps__container">
            {/* The same target id, carried by one node or the other */}
            {!replaced && <h3 id="target">Original target</h3>}
            <div className="h-200px" />
            {replaced && <h3 id="target">Replacement target</h3>}
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

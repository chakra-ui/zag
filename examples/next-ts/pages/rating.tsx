import { Global } from "@emotion/react"
import * as rating from "@zag-js/rating"
import { useMachine, useSetup } from "@zag-js/react"
import { ratingControls, ratingStyle } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

function HalfStar() {
  return (
    <svg viewBox="0 0 273 260" data-part="star">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M135.977 214.086L52.1294 259.594L69.6031 165.229L0 99.1561L95.1465 86.614L135.977 1.04785V214.086Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M135.977 213.039L219.826 258.546L202.352 164.181L271.957 98.1082L176.808 85.5661L135.977 0V213.039Z"
        fill="#bdbdbd"
      />
    </svg>
  )
}

function Star() {
  return (
    <svg viewBox="0 0 273 260" data-part="star">
      <path
        d="M136.5 0L177.83 86.614L272.977 99.1561L203.374 165.229L220.847 259.594L136.5 213.815L52.1528 259.594L69.6265 165.229L0.0233917 99.1561L95.1699 86.614L136.5 0Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function Page() {
  const controls = useControls(ratingControls)

  const [state, send] = useMachine(rating.machine, {
    context: controls.context,
  })

  const ref = useSetup({ send, id: useId() })

  const api = rating.connect(state, send)

  return (
    <>
      <Global styles={ratingStyle} />
      <main>
        <div ref={ref} {...api.rootProps}>
          <label {...api.labelProps}>Rate:</label>
          <div {...api.itemGroupProps}>
            {api.sizeArray.map((index) => {
              const state = api.getRatingState(index)
              return (
                <span key={index} {...api.getItemProps({ index })}>
                  {state.isHalf ? <HalfStar /> : <Star />}
                </span>
              )
            })}
          </div>
          <input {...api.inputProps} />
        </div>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}

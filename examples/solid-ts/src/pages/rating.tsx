import { injectGlobal } from "@emotion/css"
import * as rating from "@zag-js/rating"
import { normalizeProps, PropTypes, useMachine, useSetup } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { ratingControls } from "../../../../shared/controls"
import { ratingStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

injectGlobal(ratingStyle)

function HalfStar(props: { className: string }) {
  return (
    <svg viewBox="0 0 273 260" className={props.className}>
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M135.977 214.086L52.1294 259.594L69.6031 165.229L0 99.1561L95.1465 86.614L135.977 1.04785V214.086Z"
        fill="currentColor"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M135.977 213.039L219.826 258.546L202.352 164.181L271.957 98.1082L176.808 85.5661L135.977 0V213.039Z"
        fill="#bdbdbd"
      />
    </svg>
  )
}

function Star(props: { className: string }) {
  return (
    <svg viewBox="0 0 273 260" className={props.className}>
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

  const ref = useSetup({ send, id: createUniqueId() })

  const api = createMemo(() => rating.connect<PropTypes>(state, send, normalizeProps))

  return (
    <>
      <controls.ui />

      <div>
        <div className="rating" ref={ref} {...api().rootProps}>
          <For each={api().sizeArray}>
            {(index) => {
              const state = createMemo(() => api().getRatingState(index))
              return (
                <span className="rating__rate" {...api().getItemProps({ index })}>
                  {state().isHalf ? <HalfStar className="rating__star" /> : <Star className="rating__star" />}
                </span>
              )
            }}
          </For>
        </div>
        <input {...api().inputProps} />
      </div>

      <StateVisualizer state={state} />
    </>
  )
}

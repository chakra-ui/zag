import { injectGlobal } from "@emotion/css"
import * as Rating from "@ui-machines/rating"
import { normalizeProps, SolidPropTypes, useMachine, useSetup } from "@ui-machines/solid"
import { createMemo, createUniqueId } from "solid-js"
import { ratingStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

injectGlobal(ratingStyle)

export default function Page() {
  const [state, send] = useMachine(
    Rating.machine.withContext({
      allowHalf: true,
    }),
  )

  const ref = useSetup<HTMLDivElement>({ send, id: createUniqueId() })

  const rating = createMemo(() => Rating.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <>
      <div>
        <div className="rating" ref={ref} {...rating().rootProps}>
          {Array.from({ length: rating().size }).map((_, index) => (
            <div className="rating__rate" {...rating().getRatingProps({ index: index + 1 })} />
          ))}
        </div>
        <input {...rating().inputProps} />
      </div>

      <StateVisualizer state={state} />
    </>
  )
}

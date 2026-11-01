import * as rating from "@zag-js/rating-group"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, Index } from "solid-js"
import { ratingControls } from "@zag-js/shared"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { HalfStar, Star } from "~/components/rating-icons"
import { useControls } from "~/hooks/use-controls"
import "@styles/rating-group.css"

export default function Page() {
  const controls = useControls(ratingControls)

  const service = useMachine(
    rating.machine,
    controls.mergeProps<rating.Props>({
      id: createUniqueId(),
      defaultValue: 2.5,
    }),
  )

  const api = createMemo(() => rating.connect(service, normalizeProps))

  return (
    <>
      <main class="rating">
        <form action="" class="vstack gap-4">
          <div {...api().getRootProps()}>
            <label {...api().getLabelProps()}>Rate:</label>
            <div {...api().getControlProps()}>
              <Index each={api().items}>
                {(index) => {
                  const state = createMemo(() => api().getItemState({ index: index() }))
                  return (
                    <span {...api().getItemProps({ index: index() })}>{state().half ? <HalfStar /> : <Star />}</span>
                  )
                }}
              </Index>
            </div>
            <input {...api().getHiddenInputProps()} data-testid="hidden-input" />
          </div>
          <button type="reset">Reset</button>
        </form>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

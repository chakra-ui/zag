import * as rating from "@zag-js/rating-group"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, Index } from "solid-js"
import { HalfStar, Star } from "~/components/rating-icons"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/rating-group.css"

export default function Page() {
  const service = useMachine(rating.machine, {
    id: createUniqueId(),
    readOnly: true,
    allowHalf: true,
    defaultValue: 4.5,
  })

  const api = createMemo(() => rating.connect(service, normalizeProps))

  return (
    <>
      <main class="rating">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Average rating</label>
          <div class="hstack">
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
            <span class="rating-summary">
              <strong>{api().value}</strong> · 128 reviews
            </span>
          </div>
          <input {...api().getHiddenInputProps()} />
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

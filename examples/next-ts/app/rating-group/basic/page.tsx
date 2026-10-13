"use client"

import * as rating from "@zag-js/rating-group"
import { normalizeProps, useMachine } from "@zag-js/react"
import { ratingControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { HalfStar, Star } from "@/components/rating-icons"
import { useControls } from "@/hooks/use-controls"
import "@styles/rating-group.css"

export default function Page() {
  const controls = useControls(ratingControls)

  const service = useMachine(rating.machine, {
    id: useId(),
    defaultValue: 2.5,
    ...controls.context,
  })

  const api = rating.connect(service, normalizeProps)

  return (
    <>
      <main className="rating">
        <form action="" className="vstack gap-4">
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>Rate:</label>
            <div {...api.getControlProps()}>
              {api.items.map((index) => {
                const state = api.getItemState({ index })
                return (
                  <span key={index} {...api.getItemProps({ index })}>
                    {state.half ? <HalfStar /> : <Star />}
                  </span>
                )
              })}
            </div>
            <input {...api.getHiddenInputProps()} data-testid="hidden-input" />
          </div>
          <button type="reset">Reset</button>
        </form>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

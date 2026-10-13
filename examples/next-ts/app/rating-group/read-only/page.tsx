"use client"

import * as rating from "@zag-js/rating-group"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { HalfStar, Star } from "@/components/rating-icons"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/rating-group.css"

export default function Page() {
  const service = useMachine(rating.machine, {
    id: useId(),
    readOnly: true,
    allowHalf: true,
    defaultValue: 4.5,
  })

  const api = rating.connect(service, normalizeProps)

  return (
    <>
      <main className="rating">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Average rating</label>
          <div className="hstack">
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
            <span className="rating-summary">
              <strong>{api.value}</strong> · 128 reviews
            </span>
          </div>
          <input {...api.getHiddenInputProps()} />
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

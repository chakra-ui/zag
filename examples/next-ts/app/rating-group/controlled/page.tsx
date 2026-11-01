"use client"

import * as rating from "@zag-js/rating-group"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { Star } from "@/components/rating-icons"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/rating-group.css"

export default function Page() {
  const [value, setValue] = useState(2)

  const service = useMachine(rating.machine, {
    id: useId(),
    value,
    onValueChange(details) {
      setValue(details.value)
    },
  })

  const api = rating.connect(service, normalizeProps)

  return (
    <>
      <main className="rating">
        <div className="vstack gap-4">
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>Rate this example</label>
            <div {...api.getControlProps()}>
              {api.items.map((index) => (
                <span key={index} {...api.getItemProps({ index })}>
                  <Star />
                </span>
              ))}
            </div>
            <input {...api.getHiddenInputProps()} />
          </div>

          <output>Value: {value}</output>

          <div className="hstack">
            <button type="button" onClick={() => setValue(4)}>
              Set to 4
            </button>
            <button type="button" onClick={() => setValue(0)}>
              Clear
            </button>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

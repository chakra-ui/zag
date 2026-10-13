"use client"

import * as rating from "@zag-js/rating-group"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { Star } from "@/components/rating-icons"
import "@styles/rating-group.css"

const sizes = [
  { label: "Small", size: "16px" },
  { label: "Medium", size: "24px" },
  { label: "Large", size: "32px" },
]

function SizedRating(props: { label: string; size: string }) {
  const service = useMachine(rating.machine, {
    id: useId(),
    defaultValue: 3,
  })

  const api = rating.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()} style={{ "--rating-size": props.size } as React.CSSProperties}>
      <label {...api.getLabelProps()}>{props.label}</label>
      <div {...api.getControlProps()}>
        {api.items.map((index) => (
          <span key={index} {...api.getItemProps({ index })}>
            <Star />
          </span>
        ))}
      </div>
      <input {...api.getHiddenInputProps()} />
    </div>
  )
}

export default function Page() {
  return (
    <main className="rating">
      <div className="vstack gap-5">
        {sizes.map((item) => (
          <SizedRating key={item.label} {...item} />
        ))}
      </div>
    </main>
  )
}

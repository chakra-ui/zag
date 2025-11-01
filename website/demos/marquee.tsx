import * as marquee from "@zag-js/marquee"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

const logos = [
  { name: "Apple", logo: "🍎" },
  { name: "Banana", logo: "🍌" },
  { name: "Cherry", logo: "🍒" },
  { name: "Grape", logo: "🍇" },
  { name: "Watermelon", logo: "🍉" },
  { name: "Strawberry", logo: "🍓" },
]

interface MarqueeProps extends Omit<marquee.Props, "id"> {}

export function Marquee(props: MarqueeProps) {
  const service = useMachine(marquee.machine, {
    id: useId(),
    spacing: "2rem",
    speed: 100,
    ...props,
  })

  const api = marquee.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <div {...api.getEdgeProps({ side: "start" })} />

      <div {...api.getViewportProps()}>
        {Array.from({ length: api.contentCount }).map((_, index) => (
          <div key={index} {...api.getContentProps({ index })}>
            {logos.map((item, i) => (
              <div key={i} {...api.getItemProps()}>
                <span className="marquee-logo">{item.logo}</span>
                <span className="marquee-name">{item.name}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div {...api.getEdgeProps({ side: "end" })} />
    </div>
  )
}

import * as accordion from "@zag-js/accordion"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

const items = [
  {
    title: "Watercraft",
    desc: "Yacht, Boats and Dinghies",
    content: "Sample accordion content",
  },
  {
    title: "Automobiles",
    desc: "Cars, Trucks and Vans",
    content: "Sample accordion content",
  },
  {
    title: "Aircraft",
    desc: "Airplanes, Helicopters and Rockets",
    content: "Sample accordion content",
  },
]

type AccordionProps = {
  controls: {
    collapsible: boolean
    multiple: boolean
  }
}

export function Accordion(props: AccordionProps) {
  const [state, send] = useMachine(
    accordion.machine({ id: useId(), value: ["Aircraft"] }),
    {
      context: props.controls,
    },
  )

  const api = accordion.connect(state, send, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      {items.map((item) => (
        <div key={item.title} {...api.getItemProps({ value: item.title })}>
          <h3>
            <button {...api.getItemTriggerProps({ value: item.title })}>
              <div>{item.title}</div>
              <div>{item.desc}</div>
            </button>
          </h3>
          <div {...api.getItemContentProps({ value: item.title })}>
            {item.content}
          </div>
        </div>
      ))}
    </div>
  )
}

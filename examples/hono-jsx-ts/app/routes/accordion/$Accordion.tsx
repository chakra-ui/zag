import * as accordion from "@zag-js/accordion"
import { normalizeProps, useMachine } from "@zag-js/hono-jsx"
import { useId } from "hono/jsx"

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

type AccordionProps = Omit<accordion.Props, "id">

export default function Accordion(props: AccordionProps) {
  const service = useMachine(accordion.machine, {
    id: useId(),
    defaultValue: ["Aircraft"],
    ...props,
  })

  const api = accordion.connect(service, normalizeProps)

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
          <div {...api.getItemContentProps({ value: item.title })}>{item.content}</div>
        </div>
      ))}
    </div>
  )
}

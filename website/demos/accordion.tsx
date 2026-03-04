import * as accordion from "@zag-js/accordion"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import styles from "../styles/machines/accordion.module.css"

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

export function Accordion(props: AccordionProps) {
  const service = useMachine(accordion.machine, {
    id: useId(),
    defaultValue: ["Aircraft"],
    ...props,
  })

  const api = accordion.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      {items.map((item) => (
        <div
          key={item.title}
          className={styles.Item}
          {...api.getItemProps({ value: item.title })}
        >
          <h3>
            <button
              className={styles.ItemTrigger}
              {...api.getItemTriggerProps({ value: item.title })}
            >
              <div>{item.title}</div>
              <div>{item.desc}</div>
            </button>
          </h3>
          <div
            className={styles.ItemContent}
            {...api.getItemContentProps({ value: item.title })}
          >
            {item.content}
          </div>
        </div>
      ))}
    </div>
  )
}

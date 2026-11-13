import * as hoverCard from "@zag-js/hover-card"
import { normalizeProps, Portal, useMachine } from "@zag-js/preact"
import { useId } from "preact/hooks"
import { Presence } from "../../components/presence"
import "@styles/hover-card-viewport.css"

const people = [
  { value: "ada", name: "Ada Lovelace", bio: "Wrote the first published program." },
  { value: "grace", name: "Grace Hopper", bio: "Built the first compiler, and popularized the word bug in computing." },
  { value: "alan", name: "Alan Turing", bio: "Defined computation." },
]

const getPerson = (value: string) => people.find((person) => person.value === value)!

export default function Page() {
  const service = useMachine(hoverCard.machine, {
    id: useId(),
    positioning: { placement: "bottom" },
  })

  const api = hoverCard.connect(service, normalizeProps)

  return (
    <main className="hover-card animated-triggers">
      <p>
        Early computing owes a lot to{" "}
        {people.map((person, index) => (
          <span key={person.value}>
            <a href="#" {...api.getTriggerProps({ value: person.value })}>
              {person.name}
            </a>
            {index < people.length - 1 ? ", " : "."}
          </span>
        ))}
      </p>

      <Portal>
        <div {...api.getPositionerProps()}>
          <Presence {...api.getArrowProps()}>
            <div {...api.getArrowTipProps()} />
          </Presence>
          <Presence {...api.getViewportProps()}>
            {api.getContentValues().map((value) => (
              <Presence key={value} {...api.getContentProps({ value })}>
                <strong>{getPerson(value).name}</strong>
                <p>{getPerson(value).bio}</p>
              </Presence>
            ))}
          </Presence>
        </div>
      </Portal>
    </main>
  )
}

import * as hoverCard from "@zag-js/hover-card"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createUniqueId } from "solid-js"
import { Portal } from "@solidjs/web"
import { Presence } from "~/components/presence"
import "@styles/hover-card-viewport.css"

const people = [
  { value: "ada", name: "Ada Lovelace", bio: "Wrote the first published program." },
  { value: "grace", name: "Grace Hopper", bio: "Built the first compiler, and popularized the word bug in computing." },
  { value: "alan", name: "Alan Turing", bio: "Defined computation." },
]

const getPerson = (value: string) => people.find((person) => person.value === value)!

export default function Page() {
  const service = useMachine(hoverCard.machine, {
    id: createUniqueId(),
    positioning: { placement: "bottom" },
  })

  const api = createMemo(() => hoverCard.connect(service, normalizeProps))

  return (
    <main class="hover-card animated-triggers">
      <p>
        Early computing owes a lot to{" "}
        <For each={people}>
          {(person, index) => (
            <span>
              <a href="#" {...api().getTriggerProps({ value: person.value })}>
                {person.name}
              </a>
              {index() < people.length - 1 ? ", " : "."}
            </span>
          )}
        </For>
      </p>

      <Portal>
        <div {...api().getPositionerProps()}>
          <Presence {...api().getArrowProps()}>
            <div {...api().getArrowTipProps()} />
          </Presence>
          <Presence {...api().getViewportProps()}>
            <For each={api().getContentValues()}>
              {(value) => (
                <Presence {...api().getContentProps({ value })}>
                  <strong>{getPerson(value).name}</strong>
                  <p>{getPerson(value).bio}</p>
                </Presence>
              )}
            </For>
          </Presence>
        </div>
      </Portal>
    </main>
  )
}

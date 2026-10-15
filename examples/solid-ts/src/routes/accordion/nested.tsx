import * as accordion from "@zag-js/accordion"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ArrowRight } from "lucide-solid"
import { createMemo, createUniqueId, For, Show } from "solid-js"
import "@styles/accordion.css"

interface Section {
  value: string
  title: string
  content?: string
  children?: Section[]
}

const sections: Section[] = [
  {
    value: "getting-started",
    title: "Getting started",
    children: [
      {
        value: "installation",
        title: "Installation",
        content: "Install the machine and the adapter for your framework.",
      },
      { value: "usage", title: "Usage", content: "Create a service with useMachine, then connect it to get the API." },
    ],
  },
  {
    value: "styling",
    title: "Styling",
    children: [
      { value: "data-attributes", title: "Data attributes", content: "Every part exposes data-state for open styles." },
      { value: "animation", title: "Animation", content: "Compose with collapsible to animate the content height." },
    ],
  },
  { value: "faq", title: "FAQ", content: "Each accordion keeps its own value, focus, and keyboard handling." },
]

// Each level is its own machine, so arrow keys only move within one level
function Accordion(props: { items: Section[] }) {
  const service = useMachine(accordion.machine, { id: createUniqueId(), multiple: true })
  const api = createMemo(() => accordion.connect(service, normalizeProps))

  return (
    <div {...api().getRootProps()}>
      <For each={props.items}>
        {(item) => (
          <div {...api().getItemProps({ value: item.value })}>
            <h3 {...api().getItemHeaderProps({ value: item.value })}>
              <button {...api().getItemTriggerProps({ value: item.value })}>
                {item.title}
                <span {...api().getItemIndicatorProps({ value: item.value })}>
                  <ArrowRight />
                </span>
              </button>
            </h3>
            <div {...api().getItemContentProps({ value: item.value })}>
              <div class="accordion-item-body">
                {item.content}
                <Show when={item.children}>{(children) => <Accordion items={children()} />}</Show>
              </div>
            </div>
          </div>
        )}
      </For>
    </div>
  )
}

export default function Page() {
  return (
    <main class="accordion">
      <div class="accordion-layout">
        <Accordion items={sections} />
      </div>
    </main>
  )
}

import * as accordion from "@zag-js/accordion"
import { accordionFaqData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ArrowRight } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import { Output } from "~/components/output"
import "@styles/accordion.css"

export default function Page() {
  const id = createUniqueId()
  const [value, setValue] = createSignal<string[]>(["shipping"])

  const service = useMachine(accordion.machine, () => ({
    id,
    multiple: true,
    value: value(),
    onValueChange: (details) => setValue(details.value),
  }))

  const api = createMemo(() => accordion.connect(service, normalizeProps))

  return (
    <main class="accordion">
      <div class="accordion-layout">
        <div class="accordion-toolbar">
          <button onClick={() => setValue(accordionFaqData.map((item) => item.value))}>Expand all</button>
          <button onClick={() => setValue([])}>Collapse all</button>
        </div>

        <div {...api().getRootProps()}>
          <For each={accordionFaqData}>
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
                  <div class="accordion-item-body">{item.content}</div>
                </div>
              </div>
            )}
          </For>
        </div>

        <Output label="value" value={value()} />
      </div>
    </main>
  )
}

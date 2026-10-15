import * as accordion from "@zag-js/accordion"
import { accordionFaqData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ArrowRight } from "lucide-solid"
import { createMemo, createUniqueId, For } from "solid-js"
import "@styles/accordion.css"

export default function Page() {
  const service = useMachine(accordion.machine, { id: createUniqueId(), hiddenUntilFound: true })
  const api = createMemo(() => accordion.connect(service, normalizeProps))

  return (
    <main class="accordion">
      <div class="accordion-layout">
        <p class="accordion-hint">Search the page for “refund” or “invoices” to open the matching answer.</p>
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
      </div>
    </main>
  )
}

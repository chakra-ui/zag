import * as accordion from "@zag-js/accordion"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { accordionFaqData } from "@zag-js/shared"
import { ArrowRight } from "lucide-preact"
import { useId } from "preact/hooks"
import "@styles/accordion.css"

export default function Page() {
  const service = useMachine(accordion.machine, {
    id: useId(),
    hiddenUntilFound: true,
  })

  const api = accordion.connect(service, normalizeProps)

  return (
    <main className="accordion">
      <div className="accordion-layout">
        <p className="accordion-hint">Search the page for “refund” or “invoices” to open the matching answer.</p>
        <div {...api.getRootProps()}>
          {accordionFaqData.map((item) => (
            <div key={item.value} {...api.getItemProps({ value: item.value, disabled: item.value === "support" })}>
              <h3 {...api.getItemHeaderProps({ value: item.value, disabled: item.value === "support" })}>
                <button {...api.getItemTriggerProps({ value: item.value, disabled: item.value === "support" })}>
                  {item.title}
                  <span {...api.getItemIndicatorProps({ value: item.value, disabled: item.value === "support" })}>
                    <ArrowRight />
                  </span>
                </button>
              </h3>
              <div {...api.getItemContentProps({ value: item.value, disabled: item.value === "support" })}>
                <div className="accordion-item-body">{item.content}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

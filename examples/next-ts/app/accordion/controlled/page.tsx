"use client"

import * as accordion from "@zag-js/accordion"
import { normalizeProps, useMachine } from "@zag-js/react"
import { accordionFaqData } from "@zag-js/shared"
import { ArrowRight } from "lucide-react"
import { useId, useState } from "react"
import { Output } from "@/components/output"
import "@styles/accordion.css"

export default function Page() {
  const [value, setValue] = useState<string[]>(["shipping"])

  const service = useMachine(accordion.machine, {
    id: useId(),
    multiple: true,
    value,
    onValueChange: (details) => setValue(details.value),
  })

  const api = accordion.connect(service, normalizeProps)

  return (
    <main className="accordion">
      <div className="accordion-layout">
        <div className="accordion-toolbar">
          <button onClick={() => setValue(accordionFaqData.map((item) => item.value))}>Expand all</button>
          <button onClick={() => setValue([])}>Collapse all</button>
        </div>

        <div {...api.getRootProps()}>
          {accordionFaqData.map((item) => (
            <div key={item.value} {...api.getItemProps({ value: item.value })}>
              <h3 {...api.getItemHeaderProps({ value: item.value })}>
                <button {...api.getItemTriggerProps({ value: item.value })}>
                  {item.title}
                  <span {...api.getItemIndicatorProps({ value: item.value })}>
                    <ArrowRight />
                  </span>
                </button>
              </h3>
              <div {...api.getItemContentProps({ value: item.value })}>
                <div className="accordion-item-body">{item.content}</div>
              </div>
            </div>
          ))}
        </div>

        <Output label="value" value={value} />
      </div>
    </main>
  )
}

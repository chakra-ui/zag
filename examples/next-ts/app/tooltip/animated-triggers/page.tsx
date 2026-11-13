"use client"

import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as tooltip from "@zag-js/tooltip"
import { useId } from "react"
import { Presence } from "@/components/presence"
import "@styles/tooltip-viewport.css"

const items = [
  { value: "bold", label: "Bold", tooltip: "Bold" },
  { value: "italic", label: "Italic", tooltip: "Italic text" },
  { value: "underline", label: "Underline", tooltip: "Underline the selected text" },
]

export default function Page() {
  const service = useMachine(tooltip.machine, {
    id: useId(),
    positioning: { placement: "top" },
  })

  const api = tooltip.connect(service, normalizeProps)

  return (
    <main className="tooltip animated-triggers">
      <div className="animated-triggers__list">
        {items.map((item) => (
          <button key={item.value} {...api.getTriggerProps({ value: item.value })}>
            {item.label}
          </button>
        ))}
      </div>

      <Portal>
        <div {...api.getPositionerProps()}>
          <Presence {...api.getArrowProps()}>
            <div {...api.getArrowTipProps()} />
          </Presence>
          <Presence {...api.getViewportProps()}>
            {items.map((item) => (
              <Presence key={item.value} {...api.getContentProps({ value: item.value })}>
                {item.tooltip}
              </Presence>
            ))}
          </Presence>
        </div>
      </Portal>
    </main>
  )
}

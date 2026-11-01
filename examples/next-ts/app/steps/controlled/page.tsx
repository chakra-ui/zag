"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as steps from "@zag-js/steps"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/steps.css"

const items: steps.StepItem[] = [
  { value: "shipping", title: "Shipping" },
  { value: "payment", title: "Payment" },
  { value: "review", title: "Review" },
]

export default function Page() {
  const [value, setValue] = useState<string>(items[0].value)
  const [finished, setFinished] = useState<string[] | null>(null)

  const service = useMachine(steps.machine, {
    id: useId(),
    items,
    value,
    onValueChange(details) {
      if (details.value) setValue(details.value)
    },
    onComplete(details) {
      setFinished(details.completedValues)
    },
  })

  const api = steps.connect(service, normalizeProps)

  return (
    <>
      <main className="steps">
        <div {...api.getRootProps()}>
          <div {...api.getListProps()}>
            {items.map((item, index) => (
              <div key={item.value} {...api.getItemProps({ value: item.value })}>
                <button {...api.getTriggerProps({ value: item.value })}>
                  <div {...api.getIndicatorProps({ value: item.value })}>{index + 1}</div>
                  <span>{item.title}</span>
                </button>
                <div {...api.getSeparatorProps({ value: item.value })} />
              </div>
            ))}
          </div>

          {items.map((item) => (
            <div key={item.value} {...api.getContentProps({ value: item.value })}>
              {item.title} content
            </div>
          ))}

          <div {...api.getContentProps({ value: steps.COMPLETE })}>All done 🎉</div>

          <div>
            <button {...api.getPreviousTriggerProps()}>Back</button>
            <button {...api.getNextTriggerProps()}>Next</button>
          </div>
        </div>

        <hr style={{ margin: "2rem 0" }} />

        <p>
          External state: <code>{value === steps.COMPLETE ? "complete" : value}</code>, onComplete:{" "}
          <code>{finished ? finished.join(",") : "-"}</code>
        </p>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {items.map((item) => (
            <button key={item.value} onClick={() => setValue(item.value)}>
              Go to {item.title}
            </button>
          ))}
          <button onClick={() => setValue(steps.COMPLETE)}>Show completed</button>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as steps from "@zag-js/steps"
import { useEffect, useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/steps.css"

const remoteItems: steps.StepItem[] = [
  { value: "profile", title: "Profile" },
  { value: "team", title: "Team" },
  { value: "billing", title: "Billing", optional: true },
  { value: "done", title: "Done" },
]

export default function Page() {
  const [items, setItems] = useState<steps.StepItem[]>([])

  useEffect(() => {
    const timer = setTimeout(() => setItems(remoteItems), 1500)
    return () => clearTimeout(timer)
  }, [])

  const service = useMachine(steps.machine, {
    id: useId(),
    items,
  })

  const api = steps.connect(service, normalizeProps)

  return (
    <>
      <main className="steps">
        <div {...api.getRootProps()}>
          {items.length === 0 && <p>Loading steps…</p>}

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

          <div {...api.getContentProps({ value: steps.COMPLETE })}>All set 🎉</div>

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
            <button {...api.getPreviousTriggerProps()}>Back</button>
            <button {...api.getNextTriggerProps()}>Next</button>
            <button onClick={() => setItems([])}>Clear items</button>
            <button onClick={() => setItems(remoteItems.map((item) => ({ ...item, disabled: true })))}>
              Disable all
            </button>
            <button onClick={() => setItems(remoteItems)}>Restore items</button>
          </div>

          <p style={{ marginTop: "1rem" }}>
            While no item is navigable the value is <code>{String(api.value)}</code> and navigation is inert. Clearing
            the items mid-flow moves the value to the nearest surviving step instead of throwing.
          </p>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

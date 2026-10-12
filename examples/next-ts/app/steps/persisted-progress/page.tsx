"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as steps from "@zag-js/steps"
import { useEffect, useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/steps.css"

const STORAGE_KEY = "zag:steps-progress"

const items: steps.StepItem[] = [
  { value: "domain", title: "Connect domain", description: "Point your DNS to us" },
  { value: "branding", title: "Branding", description: "Logo and colors" },
  { value: "payouts", title: "Payouts", description: "Where we send money" },
  { value: "review", title: "Review", description: "Check and launch" },
]

interface Progress {
  value: string | null
  completedValues: string[]
}

const load = (): Progress => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")
    if (saved) return saved
  } catch {}
  return { value: items[0].value, completedValues: [] }
}

export default function Page() {
  // Empty until storage is read, so the server render matches the client
  const [progress, setProgress] = useState<Progress>({ value: null, completedValues: [] })

  useEffect(() => {
    setProgress(load())
  }, [])

  const save = (patch: Partial<Progress>) => {
    setProgress((prev) => {
      const next = { ...prev, ...patch }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const service = useMachine(steps.machine, {
    id: useId(),
    items,
    linear: true,
    orientation: "vertical",
    value: progress.value ?? undefined,
    completedValues: progress.completedValues,
    onValueChange: ({ value }) => save({ value }),
    onCompletedChange: ({ completedValues }) => save({ completedValues }),
  })

  const api = steps.connect(service, normalizeProps)

  return (
    <>
      <main className="steps">
        <div {...api.getRootProps()}>
          <div {...api.getListProps()}>
            {api.items.map((item, index) => {
              const itemState = api.getItemState({ value: item.value })
              return (
                <div key={item.value} {...api.getItemProps({ value: item.value })}>
                  <button {...api.getTriggerProps({ value: item.value })}>
                    <div {...api.getIndicatorProps({ value: item.value })}>{itemState.completed ? "✓" : index + 1}</div>
                    <span>
                      {item.title}
                      <br />
                      <small>{item.description}</small>
                    </span>
                  </button>
                  <div {...api.getSeparatorProps({ value: item.value })} />
                </div>
              )
            })}
          </div>

          <div style={{ flex: 1 }}>
            {items.map((item) => (
              <div key={item.value} {...api.getContentProps({ value: item.value })}>
                <h3>{item.title}</h3>
                <p>{item.description}. Your progress is saved, so you can leave and pick up here later.</p>
              </div>
            ))}

            <div {...api.getContentProps({ value: steps.COMPLETE })}>
              <h3>Your store is live</h3>
            </div>

            <div className="steps-actions">
              <button {...api.getPrevTriggerProps()}>Back</button>
              {!api.complete && <button {...api.getNextTriggerProps()}>{api.canComplete ? "Launch" : "Next"}</button>}
              <button onClick={() => api.resetStep()}>Reset progress</button>
            </div>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

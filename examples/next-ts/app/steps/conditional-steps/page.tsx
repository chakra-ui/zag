"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as steps from "@zag-js/steps"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/steps.css"

type Usage = "solo" | "team"

export default function Page() {
  const [name, setName] = useState("")
  const [usage, setUsage] = useState<Usage>("team")

  const items: steps.StepItem[] = [
    { value: "profile", title: "Profile", invalid: !name.trim() },
    { value: "usage", title: "Usage" },
    // Only teams invite people, so solo users never see this step
    { value: "invite", title: "Invite team", optional: true, disabled: usage === "solo" },
    { value: "calendar", title: "Connect calendar", optional: true },
  ]

  const service = useMachine(steps.machine, {
    id: useId(),
    items,
  })

  const api = steps.connect(service, normalizeProps)

  return (
    <>
      <main className="steps">
        <div {...api.getRootProps()}>
          <p>{api.complete ? "All set" : `Step ${api.index + 1} of ${api.count}`}</p>
          <div {...api.getProgressProps()}>
            <div className="steps-progress-fill" />
          </div>

          <div {...api.getListProps()}>
            {api.items.map((item, index) => {
              const itemState = api.getItemState({ value: item.value })
              return (
                <div key={item.value} {...api.getItemProps({ value: item.value })}>
                  <button {...api.getTriggerProps({ value: item.value })}>
                    <div {...api.getIndicatorProps({ value: item.value })}>
                      {itemState.completed ? "✓" : itemState.skipped ? "–" : index + 1}
                    </div>
                    <span>{item.title}</span>
                  </button>
                  <div {...api.getSeparatorProps({ value: item.value })} />
                </div>
              )
            })}
          </div>

          <div {...api.getContentProps({ value: "profile" })} className="steps-form">
            <label>
              Your name
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>
          </div>

          <div {...api.getContentProps({ value: "usage" })} className="steps-form">
            {(["solo", "team"] as const).map((option) => (
              <label key={option} style={{ flexDirection: "row" }}>
                <input type="radio" name="usage" checked={usage === option} onChange={() => setUsage(option)} />
                {option === "solo" ? "Just me" : "With my team"}
              </label>
            ))}
          </div>

          <div {...api.getContentProps({ value: "invite" })} className="steps-form">
            <label>
              Teammate emails
              <textarea placeholder="ada@example.com, alan@example.com" />
            </label>
          </div>

          <div {...api.getContentProps({ value: "calendar" })}>
            <p>Sync your calendar to see meetings next to your tasks.</p>
            <button>Connect Google Calendar</button>
          </div>

          <div {...api.getContentProps({ value: steps.COMPLETE })}>
            <p>Welcome aboard, {name}!</p>
            <button onClick={() => api.resetStep()}>Start over</button>
          </div>

          {!api.complete && (
            <div className="steps-actions">
              <button {...api.getPreviousTriggerProps()}>Back</button>
              <button {...api.getSkipTriggerProps()}>Do it later</button>
              <button {...api.getNextTriggerProps()}>{api.canComplete ? "Finish" : "Continue"}</button>
            </div>
          )}
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

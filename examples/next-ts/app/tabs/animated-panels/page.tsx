"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as tabs from "@zag-js/tabs"
import { useId } from "react"
import { Presence } from "@/components/presence"
import "@styles/tabs.css"

const items = [
  { value: "overview", label: "Overview", content: "Workspace stats and activity." },
  { value: "projects", label: "Projects", content: "Milestones and deadlines." },
  { value: "account", label: "Account", content: "Profile and preferences." },
]

export default function Page() {
  const service = useMachine(tabs.machine, {
    id: useId(),
    defaultValue: "overview",
  })

  const api = tabs.connect(service, normalizeProps)

  return (
    <main className="tabs">
      <div {...api.getRootProps()} className="animated-tabs">
        <div {...api.getListProps()}>
          {items.map((item) => (
            <button key={item.value} {...api.getTriggerProps({ value: item.value })}>
              {item.label}
            </button>
          ))}
          <div {...api.getIndicatorProps()} />
        </div>
        <div className="animated-tabs__viewport">
          {items.map((item) => (
            <Presence key={item.value} {...api.getContentProps({ value: item.value })} skipAnimationOnMount>
              <p>{item.content}</p>
            </Presence>
          ))}
        </div>
      </div>
    </main>
  )
}

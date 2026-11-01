"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as toggle from "@zag-js/toggle-group"
import { LayoutGridIcon, ListIcon } from "lucide-react"
import { useId } from "react"
import "@styles/toggle-group.css"

const views = [
  { value: "grid", label: "Grid", icon: LayoutGridIcon },
  { value: "list", label: "List", icon: ListIcon },
] as const

export default function Page() {
  const service = useMachine(toggle.machine, {
    id: useId(),
    defaultValue: ["grid"],
    deselectable: false,
  })

  const api = toggle.connect(service, normalizeProps)

  return (
    <main className="toggle-group">
      <div className="vstack gap-4">
        <div {...api.getRootProps()} aria-label="View">
          {views.map((view) => (
            <button key={view.value} {...api.getItemProps({ value: view.value })}>
              <view.icon />
              {view.label}
            </button>
          ))}
        </div>

        <div className="toggle-group-items" data-view={api.value[0]}>
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} />
          ))}
        </div>
      </div>
    </main>
  )
}

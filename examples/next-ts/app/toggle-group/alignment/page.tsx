"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as toggle from "@zag-js/toggle-group"
import { AlignCenterIcon, AlignJustifyIcon, AlignLeftIcon, AlignRightIcon } from "lucide-react"
import { useId } from "react"
import "@styles/toggle-group.css"

const options = [
  { value: "left", label: "Align left", icon: AlignLeftIcon },
  { value: "center", label: "Align center", icon: AlignCenterIcon },
  { value: "right", label: "Align right", icon: AlignRightIcon },
  { value: "justify", label: "Justify", icon: AlignJustifyIcon },
] as const

export default function Page() {
  const service = useMachine(toggle.machine, {
    id: useId(),
    defaultValue: ["left"],
    // Single choice that can't be cleared, like a radio group
    deselectable: false,
  })

  const api = toggle.connect(service, normalizeProps)

  return (
    <main className="toggle-group">
      <div className="vstack gap-4">
        <div {...api.getRootProps()} aria-label="Text alignment">
          {options.map((option) => (
            <button
              key={option.value}
              {...api.getItemProps({ value: option.value })}
              aria-label={option.label}
              title={option.label}
            >
              <option.icon />
            </button>
          ))}
        </div>

        <p className="toggle-group-preview" style={{ textAlign: api.value[0] as "left" }}>
          Zag machines handle the behavior; you bring the markup and styles. This paragraph follows the selected
          alignment.
        </p>
      </div>
    </main>
  )
}

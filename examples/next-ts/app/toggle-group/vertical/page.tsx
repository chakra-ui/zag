"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as toggle from "@zag-js/toggle-group"
import { EraserIcon, HandIcon, MousePointer2Icon, PencilIcon, SquareIcon } from "lucide-react"
import { useId } from "react"
import "@styles/toggle-group.css"

const tools = [
  { value: "select", label: "Select", icon: MousePointer2Icon },
  { value: "hand", label: "Hand", icon: HandIcon },
  { value: "pencil", label: "Pencil", icon: PencilIcon },
  { value: "shape", label: "Shape", icon: SquareIcon },
  { value: "eraser", label: "Eraser", icon: EraserIcon },
] as const

export default function Page() {
  const service = useMachine(toggle.machine, {
    id: useId(),
    orientation: "vertical",
    defaultValue: ["select"],
    deselectable: false,
  })

  const api = toggle.connect(service, normalizeProps)

  return (
    <main className="toggle-group">
      <div className="hstack gap-4 items-start">
        {/* Arrow up/down move focus in a vertical group */}
        <div {...api.getRootProps()} aria-label="Tools">
          {tools.map((tool) => (
            <button
              key={tool.value}
              {...api.getItemProps({ value: tool.value })}
              aria-label={tool.label}
              title={tool.label}
            >
              <tool.icon />
            </button>
          ))}
        </div>
        <p className="toggle-group-preview">
          Active tool: <strong>{tools.find((tool) => tool.value === api.value[0])?.label}</strong>
        </p>
      </div>
    </main>
  )
}

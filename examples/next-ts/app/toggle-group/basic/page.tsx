"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import { toggleGroupControls, toggleGroupData } from "@zag-js/shared"
import * as toggle from "@zag-js/toggle-group"
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react"
import { useId } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { useControls } from "@/hooks/use-controls"
import "@styles/toggle-group.css"

const icons = { bold: BoldIcon, italic: ItalicIcon, underline: UnderlineIcon }

export default function Page() {
  const controls = useControls(toggleGroupControls)

  const service = useMachine(toggle.machine, {
    id: useId(),
    ...controls.context,
  })
  const api = toggle.connect(service, normalizeProps)

  return (
    <>
      <main className="toggle-group">
        <div className="hstack gap-4">
          {/* Focus target outside the group, for tab order checks */}
          <button>Outside</button>
          <div {...api.getRootProps()}>
            {toggleGroupData.map((item) => {
              const Icon = icons[item.value as keyof typeof icons]
              return (
                <button key={item.value} {...api.getItemProps({ value: item.value })} aria-label={item.value}>
                  <Icon />
                </button>
              )
            })}
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} context={["focusedValue"]} />
      </Toolbar>
    </>
  )
}

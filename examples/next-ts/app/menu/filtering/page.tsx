"use client"

import { createFilter } from "@zag-js/i18n-utils"
import * as menu from "@zag-js/menu"
import { mergeProps, normalizeProps, Portal, useMachine } from "@zag-js/react"
import { menuFilterData } from "@zag-js/shared"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/menu.css"

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [query, setQuery] = useState("")

  const service = useMachine(menu.machine, {
    id: useId(),
    composite: false,
    onOpenChange(details) {
      if (!details.open) setQuery("")
    },
  })

  const api = menu.connect(service, normalizeProps)
  const items = menuFilterData.actions.filter((item) => contains(item.label, query))

  return (
    <>
      <main>
        <div>
          <button data-testid="trigger" {...api.getTriggerProps()}>
            Actions
          </button>

          <Portal>
            <div {...api.getPositionerProps()}>
              <div data-testid="menu" {...api.getContentProps()}>
                <input
                  data-testid="input"
                  aria-label="Filter actions"
                  placeholder="Search actions..."
                  {...mergeProps(api.getInputProps(), {
                    value: query,
                    onChange: (event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.currentTarget.value),
                  })}
                />
                {items.length === 0 && <div data-menu-empty="">No actions found</div>}
                <div {...api.getListProps()}>
                  {items.map((item) => (
                    <div key={item.value} data-testid={item.value} {...api.getItemProps({ value: item.value })}>
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Portal>
        </div>
      </main>

      <Toolbar controls={null}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

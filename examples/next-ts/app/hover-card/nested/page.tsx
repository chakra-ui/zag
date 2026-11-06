"use client"

import * as hoverCard from "@zag-js/hover-card"
import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId } from "react"
import "@styles/hover-card.css"
import "@styles/menu.css"

export default function Page() {
  const parentService = useMachine(hoverCard.machine, { id: useId() })
  const childService = useMachine(hoverCard.machine, { id: useId(), positioning: { placement: "right" } })
  const menuService = useMachine(menu.machine, { id: useId() })

  const parent = hoverCard.connect(parentService, normalizeProps)
  const child = hoverCard.connect(childService, normalizeProps)
  const actions = menu.connect(menuService, normalizeProps)

  return (
    <main className="hover-card">
      <a href="#" data-testid="parent-trigger" {...parent.getTriggerProps()}>
        Zag.js
      </a>

      {parent.open && (
        <Portal>
          <div {...parent.getPositionerProps()}>
            <div data-testid="parent-content" {...parent.getContentProps()}>
              <p>UI components powered by state machines.</p>
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <a href="#" data-testid="child-trigger" {...child.getTriggerProps()}>
                  @segunadebayo
                </a>
                <button data-testid="menu-trigger" {...actions.getTriggerProps()}>
                  Actions
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {child.open && (
        <Portal>
          <div {...child.getPositionerProps()}>
            <div data-testid="child-content" {...child.getContentProps()}>
              Segun Adebayo, creator of Zag.js
            </div>
          </div>
        </Portal>
      )}

      {actions.open && (
        <Portal>
          <div {...actions.getPositionerProps()}>
            <ul data-testid="menu-content" {...actions.getContentProps()}>
              <li {...actions.getItemProps({ value: "follow" })}>Follow</li>
              <li {...actions.getItemProps({ value: "share" })}>Share</li>
            </ul>
          </div>
        </Portal>
      )}
    </main>
  )
}

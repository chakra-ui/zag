import * as hoverCard from "@zag-js/hover-card"
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "@solidjs/web"
import "@styles/hover-card.css"
import "@styles/menu.css"

export default function Page() {
  const parentService = useMachine(hoverCard.machine, { id: createUniqueId() })
  const childService = useMachine(hoverCard.machine, { id: createUniqueId(), positioning: { placement: "right" } })
  const menuService = useMachine(menu.machine, { id: createUniqueId() })

  const parent = createMemo(() => hoverCard.connect(parentService, normalizeProps))
  const child = createMemo(() => hoverCard.connect(childService, normalizeProps))
  const actions = createMemo(() => menu.connect(menuService, normalizeProps))

  return (
    <main class="hover-card">
      <a href="#" data-testid="parent-trigger" {...parent().getTriggerProps()}>
        Zag.js
      </a>

      <Show when={parent().open}>
        <Portal>
          <div {...parent().getPositionerProps()}>
            <div data-testid="parent-content" {...parent().getContentProps()}>
              <p>UI components powered by state machines.</p>
              <div style={{ display: "flex", gap: "16px", "align-items": "center" }}>
                <a href="#" data-testid="child-trigger" {...child().getTriggerProps()}>
                  @segunadebayo
                </a>
                <button data-testid="menu-trigger" {...actions().getTriggerProps()}>
                  Actions
                </button>
              </div>
            </div>
          </div>
        </Portal>
      </Show>

      <Show when={child().open}>
        <Portal>
          <div {...child().getPositionerProps()}>
            <div data-testid="child-content" {...child().getContentProps()}>
              Segun Adebayo, creator of Zag.js
            </div>
          </div>
        </Portal>
      </Show>

      <Show when={actions().open}>
        <Portal>
          <div {...actions().getPositionerProps()}>
            <ul data-testid="menu-content" {...actions().getContentProps()}>
              <li {...actions().getItemProps({ value: "follow" })}>Follow</li>
              <li {...actions().getItemProps({ value: "share" })}>Share</li>
            </ul>
          </div>
        </Portal>
      </Show>
    </main>
  )
}

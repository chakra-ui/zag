"use client"

import { mergeProps, normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as menu from "@zag-js/menu"
import * as toolbar from "@zag-js/toolbar"
import { useId } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar as ControlsPanel } from "@/components/toolbar"
import "@styles/toolbar.css"
import "@styles/menu.css"

function MoreActionsMenu(props: { api: toolbar.Api }) {
  const { api } = props
  const triggerId = api.getItemId("more")

  const service = useMachine(menu.machine, {
    id: useId(),
    ids: { trigger: triggerId },
    onSelect: console.log,
  })
  const menuApi = menu.connect(service, normalizeProps)

  return (
    <>
      <button {...mergeProps(menuApi.getTriggerProps(), api.getItemProps({ value: "more" }))}>
        More actions <span {...menuApi.getIndicatorProps()}>▾</span>
      </button>
      {menuApi.open && (
        <Portal>
          <div {...menuApi.getPositionerProps()}>
            <ul {...menuApi.getContentProps()}>
              <li {...menuApi.getItemProps({ value: "help" })}>Help</li>
              <li {...menuApi.getItemProps({ value: "shortcuts" })}>Keyboard Shortcuts</li>
              <li {...menuApi.getItemProps({ value: "release-notes" })}>Release Notes</li>
            </ul>
          </div>
        </Portal>
      )}
    </>
  )
}

export default function Page() {
  const service = useMachine(toolbar.machine, { id: useId() })
  const api = toolbar.connect(service, normalizeProps)

  return (
    <>
      <main className="toolbar">
        <div {...api.getRootProps()}>
          <button {...api.getItemProps({ value: "cut" })}>Cut</button>
          <button {...api.getItemProps({ value: "copy" })}>Copy</button>
          <button {...api.getItemProps({ value: "paste" })}>Paste</button>

          <div {...api.getSeparatorProps()} />

          <MoreActionsMenu api={api} />
        </div>
        <p>
          Open the menu and use arrow keys — they navigate menu items, not the toolbar. Closing the menu returns roving
          focus to the toolbar.
        </p>
      </main>

      <ControlsPanel>
        <StateVisualizer state={service} />
      </ControlsPanel>
    </>
  )
}

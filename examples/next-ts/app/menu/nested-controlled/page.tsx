"use client"

import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { useEffectOnce } from "@/hooks/use-effect-once"
import "@styles/menu.css"

const rootItems = [
  { label: "New File", value: "new-file" },
  { label: "Share →", value: "share" },
  { label: "Export →", value: "export" },
  { label: "Delete", value: "delete" },
]

const submenuItems: Record<string, { label: string; value: string }[]> = {
  share: [
    { label: "Email", value: "email" },
    { label: "Copy Link", value: "copy-link" },
  ],
  export: [
    { label: "PDF", value: "pdf" },
    { label: "PNG", value: "png" },
  ],
}

function useControlledMenu() {
  const [open, setOpen] = useState(false)
  return useMachine(menu.machine, {
    id: useId(),
    open,
    onOpenChange: (details) => setOpen(details.open),
  })
}

export default function Page() {
  const rootService = useControlledMenu()
  const root = menu.connect(rootService, normalizeProps)

  const shareService = useControlledMenu()
  const share = menu.connect(shareService, normalizeProps)

  const exportService = useControlledMenu()
  const exportMenu = menu.connect(exportService, normalizeProps)

  const submenus = [
    { value: "share", service: shareService, api: share },
    { value: "export", service: exportService, api: exportMenu },
  ]

  useEffectOnce(() => {
    submenus.forEach(({ service, api }) => {
      root.setChild(service)
      api.setParent(rootService)
    })
  })

  return (
    <>
      <main>
        <div>
          <button data-testid="trigger" {...root.getTriggerProps()}>
            Click me
          </button>

          <Portal>
            <div {...root.getPositionerProps()}>
              <ul data-testid="menu" {...root.getContentProps()}>
                {rootItems.map((item) => {
                  const sub = submenus.find((s) => s.value === item.value)
                  const props = sub ? root.getTriggerItemProps(sub.api) : root.getItemProps({ value: item.value })
                  return (
                    <li key={item.value} data-testid={item.value} {...props}>
                      {item.label}
                    </li>
                  )
                })}
              </ul>
            </div>
          </Portal>

          {submenus.map(({ value, api }) => (
            <Portal key={value}>
              <div {...api.getPositionerProps()}>
                <ul data-testid={`${value}-submenu`} {...api.getContentProps()}>
                  {submenuItems[value].map((item) => (
                    <li key={item.value} data-testid={item.value} {...api.getItemProps({ value: item.value })}>
                      {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            </Portal>
          ))}
        </div>
      </main>

      <Toolbar controls={null}>
        <StateVisualizer state={rootService} label="Root Machine" />
        <StateVisualizer state={shareService} label="Share Machine" />
        <StateVisualizer state={exportService} label="Export Machine" />
      </Toolbar>
    </>
  )
}

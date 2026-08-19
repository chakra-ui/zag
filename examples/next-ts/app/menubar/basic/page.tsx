"use client"

import * as menu from "@zag-js/menu"
import * as menubar from "@zag-js/menubar"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useSearchParams } from "next/navigation"
import { createContext, Suspense, useContext, useId } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/menu.css"

const MenubarContext = createContext<menu.MenubarContext | undefined>(undefined)

interface MenuProps {
  id: string
  label: string
  items: { value: string; label: string }[]
}

function Menu(props: MenuProps) {
  const menubarContext = useContext(MenubarContext)
  const service = useMachine(menu.machine, {
    id: props.id,
    menubar: menubarContext,
    onSelect: ({ value }) => console.log(`[${props.label}]`, value),
  })
  const api = menu.connect(service, normalizeProps)
  return (
    <>
      <button data-testid={`${props.id}:trigger`} {...api.getTriggerProps()}>
        {props.label}
      </button>
      {api.open && (
        <Portal>
          <div {...api.getPositionerProps()}>
            <ul data-testid={`${props.id}:content`} {...api.getContentProps()}>
              {props.items.map((item) => (
                <li key={item.value} {...api.getItemProps({ value: item.value })}>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </Portal>
      )}
    </>
  )
}

const menus: MenuProps[] = [
  {
    id: "file",
    label: "File",
    items: [
      { value: "new", label: "New File" },
      { value: "open", label: "Open..." },
      { value: "save", label: "Save" },
      { value: "save-as", label: "Save As..." },
    ],
  },
  {
    id: "edit",
    label: "Edit",
    items: [
      { value: "undo", label: "Undo" },
      { value: "redo", label: "Redo" },
      { value: "cut", label: "Cut" },
      { value: "copy", label: "Copy" },
      { value: "paste", label: "Paste" },
    ],
  },
  {
    id: "view",
    label: "View",
    items: [
      { value: "zoom-in", label: "Zoom In" },
      { value: "zoom-out", label: "Zoom Out" },
      { value: "fullscreen", label: "Toggle Fullscreen" },
    ],
  },
]

function Menubar() {
  const params = useSearchParams()
  const disabled = params.get("disabled") === "true"
  const service = useMachine(menubar.machine, { id: useId(), disabled })
  const api = menubar.connect(service, normalizeProps)

  return (
    <>
      <main className="menubar">
        <MenubarContext.Provider value={api.getMenuContext()}>
          <div {...api.getRootProps()} style={{ display: "inline-flex", gap: "4px" }}>
            {menus.map((m) => (
              <Menu key={m.id} {...m} />
            ))}
          </div>
        </MenubarContext.Provider>
        <p style={{ marginTop: 24 }}>hasOpenMenu: {String(api.hasOpenMenu)}</p>
      </main>
      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

export default function Page() {
  return (
    <Suspense>
      <Menubar />
    </Suspense>
  )
}

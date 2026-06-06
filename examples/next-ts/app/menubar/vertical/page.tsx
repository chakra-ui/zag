"use client"

import * as menu from "@zag-js/menu"
import * as menubar from "@zag-js/menubar"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { createContext, useContext, useId } from "react"
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
    // Vertical menubar menus fly out to the side.
    positioning: { placement: "right-start", gutter: 4 },
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
                <li key={item.value} data-testid={item.value} {...api.getItemProps({ value: item.value })}>
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
    ],
  },
  {
    id: "edit",
    label: "Edit",
    items: [
      { value: "undo", label: "Undo" },
      { value: "redo", label: "Redo" },
      { value: "cut", label: "Cut" },
    ],
  },
  {
    id: "view",
    label: "View",
    items: [
      { value: "zoom-in", label: "Zoom In" },
      { value: "zoom-out", label: "Zoom Out" },
    ],
  },
]

export default function Page() {
  const service = useMachine(menubar.machine, { id: useId(), orientation: "vertical" })
  const api = menubar.connect(service, normalizeProps)

  return (
    <>
      <main className="menubar">
        <MenubarContext.Provider value={api.getMenuContext()}>
          <div
            {...api.getRootProps()}
            style={{ display: "inline-flex", flexDirection: "column", gap: "4px", width: 160 }}
          >
            {menus.map((m) => (
              <Menu key={m.id} {...m} />
            ))}
          </div>
        </MenubarContext.Provider>
      </main>
      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

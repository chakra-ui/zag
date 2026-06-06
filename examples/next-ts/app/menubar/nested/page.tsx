"use client"

import * as menu from "@zag-js/menu"
import * as menubar from "@zag-js/menubar"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { createContext, useContext, useId } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { useEffectOnce } from "@/hooks/use-effect-once"
import "@styles/menu.css"

const MenubarContext = createContext<menu.MenubarContext | undefined>(undefined)

interface SimpleMenuProps {
  id: string
  label: string
  items: { value: string; label: string }[]
}

function SimpleMenu(props: SimpleMenuProps) {
  const menubarContext = useContext(MenubarContext)
  const service = useMachine(menu.machine, { id: props.id, menubar: menubarContext })
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

function EditMenu() {
  const menubarContext = useContext(MenubarContext)
  const service = useMachine(menu.machine, { id: "edit", menubar: menubarContext })
  const api = menu.connect(service, normalizeProps)

  // The submenu is not a menubar menu (no `menubar` prop) — it's linked via setParent/setChild.
  const subService = useMachine(menu.machine, { id: "find" })
  const sub = menu.connect(subService, normalizeProps)

  useEffectOnce(() => {
    api.setChild(subService)
    sub.setParent(service)
  })

  return (
    <>
      <button data-testid="edit:trigger" {...api.getTriggerProps()}>
        Edit
      </button>
      {api.open && (
        <Portal>
          <div {...api.getPositionerProps()}>
            <ul data-testid="edit:content" {...api.getContentProps()}>
              <li data-testid="undo" {...api.getItemProps({ value: "undo" })}>
                Undo
              </li>
              <li data-testid="redo" {...api.getItemProps({ value: "redo" })}>
                Redo
              </li>
              <li data-testid="find:trigger" {...api.getTriggerItemProps(sub)}>
                Find ▸
              </li>
            </ul>
          </div>
        </Portal>
      )}
      {sub.open && (
        <Portal>
          <div {...sub.getPositionerProps()}>
            <ul data-testid="find:content" {...sub.getContentProps()}>
              <li data-testid="find-text" {...sub.getItemProps({ value: "find-text" })}>
                Find...
              </li>
              <li data-testid="replace" {...sub.getItemProps({ value: "replace" })}>
                Replace...
              </li>
              <li data-testid="find-in-files" {...sub.getItemProps({ value: "find-in-files" })}>
                Find in Files...
              </li>
            </ul>
          </div>
        </Portal>
      )}
    </>
  )
}

export default function Page() {
  const service = useMachine(menubar.machine, { id: useId() })
  const api = menubar.connect(service, normalizeProps)

  return (
    <>
      <main className="menubar">
        <MenubarContext.Provider value={api.getMenuContext()}>
          <div {...api.getRootProps()} style={{ display: "inline-flex", gap: "4px" }}>
            <SimpleMenu
              id="file"
              label="File"
              items={[
                { value: "new", label: "New File" },
                { value: "open", label: "Open..." },
                { value: "save", label: "Save" },
              ]}
            />
            <EditMenu />
            <SimpleMenu
              id="view"
              label="View"
              items={[
                { value: "zoom-in", label: "Zoom In" },
                { value: "zoom-out", label: "Zoom Out" },
              ]}
            />
          </div>
        </MenubarContext.Provider>
      </main>
      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

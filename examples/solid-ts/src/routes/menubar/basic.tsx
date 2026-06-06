import * as menu from "@zag-js/menu"
import * as menubar from "@zag-js/menubar"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createContext, For, createMemo, createUniqueId, useContext } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/menu.css"

const MenubarContext = createContext<menu.MenubarContext>()

interface MenuProps {
  id: string
  label: string
  items: { value: string; label: string }[]
}

function Menu(props: MenuProps) {
  const menubarContext = useContext(MenubarContext)
  const service = useMachine(menu.machine, { id: props.id, menubar: menubarContext })
  const api = createMemo(() => menu.connect(service, normalizeProps))
  return (
    <>
      <button data-testid={`${props.id}:trigger`} {...api().getTriggerProps()}>
        {props.label}
      </button>
      {api().open && (
        <Portal>
          <div {...api().getPositionerProps()}>
            <ul data-testid={`${props.id}:content`} {...api().getContentProps()}>
              <For each={props.items}>
                {(item) => (
                  <li data-testid={item.value} {...api().getItemProps({ value: item.value })}>
                    {item.label}
                  </li>
                )}
              </For>
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
  const service = useMachine(menubar.machine, { id: createUniqueId() })
  const api = createMemo(() => menubar.connect(service, normalizeProps))

  return (
    <>
      <main class="menubar">
        <MenubarContext.Provider value={api().getMenuContext()}>
          <div {...api().getRootProps()} style={{ display: "inline-flex", gap: "4px" }}>
            <For each={menus}>{(m) => <Menu {...m} />}</For>
          </div>
        </MenubarContext.Provider>
      </main>
      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

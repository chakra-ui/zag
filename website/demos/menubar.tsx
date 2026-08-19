import * as menu from "@zag-js/menu"
import * as menubar from "@zag-js/menubar"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { createContext, useContext, useId } from "react"
import menuStyles from "../styles/machines/menu.module.css"
import styles from "../styles/machines/menubar.module.css"

const MenubarContext = createContext<menu.MenubarContext | undefined>(undefined)

const data: Record<string, string[]> = {
  File: ["New File", "Open...", "Save"],
  Edit: ["Undo", "Redo", "Cut", "Copy"],
  View: ["Zoom In", "Zoom Out"],
}

interface MenuProps {
  id: string
  label: string
  items: string[]
  placement: "bottom-start" | "right-start"
}

function Menu(props: MenuProps) {
  const menubarContext = useContext(MenubarContext)
  const service = useMachine(menu.machine, {
    id: props.id,
    menubar: menubarContext,
    positioning: { placement: props.placement },
  })
  const api = menu.connect(service, normalizeProps)
  return (
    <>
      <button className={menuStyles.Trigger} {...api.getTriggerProps()}>
        {props.label}
      </button>
      <Portal>
        <div {...api.getPositionerProps()}>
          <ul className={menuStyles.Content} {...api.getContentProps()}>
            {props.items.map((item) => (
              <li
                className={menuStyles.Item}
                key={item}
                {...api.getItemProps({ value: item })}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Portal>
    </>
  )
}

interface MenubarProps extends Omit<menubar.Props, "id"> {}

export function Menubar(props: MenubarProps) {
  const service = useMachine(menubar.machine, { id: useId(), ...props })
  const api = menubar.connect(service, normalizeProps)
  const placement =
    api.orientation === "vertical" ? "right-start" : "bottom-start"

  return (
    <MenubarContext.Provider value={api.getMenuContext()}>
      <div className={styles.Root} {...api.getRootProps()}>
        {Object.entries(data).map(([label, items], index) => (
          <Menu
            key={label}
            id={`menu-${index}`}
            label={label}
            items={items}
            placement={placement}
          />
        ))}
      </div>
    </MenubarContext.Provider>
  )
}

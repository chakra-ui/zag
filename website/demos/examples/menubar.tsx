import * as menu from "@zag-js/menu"
import * as menubar from "@zag-js/menubar"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { createContext, useContext, useEffect, useId, useState } from "react"
import menuStyles from "../../styles/machines/menu.module.css"
import styles from "../../styles/machines/menubar.module.css"
import { Log, Stack } from "./shared"

const MenubarContext = createContext<menu.MenubarContext | undefined>(undefined)
const SelectContext = createContext<(value: string) => void>(() => {})

const data: Record<string, string[]> = {
  File: ["New File", "Open…", "Save"],
  Edit: ["Undo", "Redo", "Cut", "Copy"],
  View: ["Zoom In", "Zoom Out"],
}

function useBarMenu(placement: "bottom-start" | "right-start") {
  const menubarContext = useContext(MenubarContext)
  const onSelect = useContext(SelectContext)
  const service = useMachine(menu.machine, {
    id: useId(),
    menubar: menubarContext,
    positioning: { placement },
    onSelect: (details) => onSelect(details.value),
  })
  return [service, menu.connect(service, normalizeProps)] as const
}

function Content(props: { api: menu.Api; children: React.ReactNode }) {
  return (
    <Portal>
      <div {...props.api.getPositionerProps()}>
        <ul className={menuStyles.Content} {...props.api.getContentProps()}>
          {props.children}
        </ul>
      </div>
    </Portal>
  )
}

interface MenuProps {
  label: string
  items: string[]
  placement: "bottom-start" | "right-start"
}

function Menu(props: MenuProps) {
  const [, api] = useBarMenu(props.placement)
  return (
    <>
      <button className={styles.Trigger} {...api.getTriggerProps()}>
        {props.label}
      </button>
      <Content api={api}>
        {props.items.map((item) => (
          <li
            key={item}
            className={menuStyles.Item}
            {...api.getItemProps({ value: item })}
          >
            {item}
          </li>
        ))}
      </Content>
    </>
  )
}

function EditMenu(props: { placement: "bottom-start" | "right-start" }) {
  const [service, api] = useBarMenu(props.placement)
  const onSelect = useContext(SelectContext)
  const subService = useMachine(menu.machine, {
    id: useId(),
    onSelect: (details) => onSelect(details.value),
  })
  const sub = menu.connect(subService, normalizeProps)

  useEffect(() => {
    api.setChild(subService)
    sub.setParent(service)
  }, [])

  return (
    <>
      <button className={styles.Trigger} {...api.getTriggerProps()}>
        Edit
      </button>
      <Content api={api}>
        {["Undo", "Redo"].map((item) => (
          <li
            key={item}
            className={menuStyles.Item}
            {...api.getItemProps({ value: item })}
          >
            {item}
          </li>
        ))}
        <li
          className={`${menuStyles.Item} ${styles.SubTrigger}`}
          {...api.getTriggerItemProps(sub)}
        >
          Find
          <span className={styles.SubIndicator} aria-hidden>
            ›
          </span>
        </li>
      </Content>
      <Content api={sub}>
        {["Find…", "Replace…", "Find in Files…"].map((item) => (
          <li
            key={item}
            className={menuStyles.Item}
            {...sub.getItemProps({ value: item })}
          >
            {item}
          </li>
        ))}
      </Content>
    </>
  )
}

interface BarProps extends Partial<menubar.Props> {
  nested?: boolean
}

function Bar(props: BarProps) {
  const { nested, ...rest } = props
  const [value, setValue] = useState("—")
  const service = useMachine(menubar.machine, { id: useId(), ...rest })
  const api = menubar.connect(service, normalizeProps)
  const placement =
    api.orientation === "vertical" ? "right-start" : "bottom-start"

  return (
    <Stack>
      <SelectContext.Provider value={setValue}>
        <MenubarContext.Provider value={api.getMenuContext()}>
          <div className={styles.Root} {...api.getRootProps()}>
            {Object.entries(data).map(([label, items]) =>
              nested && label === "Edit" ? (
                <EditMenu key={label} placement={placement} />
              ) : (
                <Menu
                  key={label}
                  label={label}
                  items={items}
                  placement={placement}
                />
              ),
            )}
          </div>
        </MenubarContext.Provider>
      </SelectContext.Provider>
      <Log label="onSelect" value={value} />
    </Stack>
  )
}

export function MenubarNested() {
  return <Bar nested />
}

export function MenubarVertical() {
  return <Bar orientation="vertical" />
}

export function MenubarDisabled() {
  return <Bar disabled />
}

export function MenubarNoLoop() {
  return <Bar loopFocus={false} />
}

"use client"

import * as menu from "@zag-js/menu"
import * as menubar from "@zag-js/menubar"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { createContext, useContext, useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/menu.css"

const MenubarContext = createContext<menu.MenubarContext | undefined>(undefined)

interface Action {
  value: string
  label: string
  shortcut?: string
  disabled?: boolean
}

const fileActions: Action[] = [
  { value: "new", label: "New", shortcut: "⌘N" },
  { value: "save", label: "Save", shortcut: "⌘S" },
  { value: "export", label: "Export…", disabled: true },
]

const editActions: Action[] = [
  { value: "undo", label: "Undo", shortcut: "⌘Z" },
  { value: "redo", label: "Redo", shortcut: "⇧⌘Z", disabled: true },
  { value: "select-all", label: "Select all", shortcut: "⌘A" },
]

const themes = ["Light", "Dark", "System"]

function ActionMenu(props: { id: string; label: string; actions: Action[]; onRun: (label: string) => void }) {
  const { id, label, actions, onRun } = props
  const service = useMachine(menu.machine, {
    id,
    menubar: useContext(MenubarContext),
    onSelect: (details) => {
      const action = actions.find((item) => item.value === details.value)
      if (action) onRun(action.label)
    },
  })
  const api = menu.connect(service, normalizeProps)

  return (
    <>
      <button {...api.getTriggerProps()}>{label}</button>
      {api.open && (
        <Portal>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <ul {...api.getListProps()}>
                {actions.map((action) => (
                  <li key={action.value} {...api.getItemProps({ value: action.value, disabled: action.disabled })}>
                    {action.label}
                    {action.shortcut && <kbd className="shortcut">{action.shortcut}</kbd>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}

interface ViewSettings {
  lineNumbers: boolean
  wordWrap: boolean
  theme: string
}

function ViewMenu(props: { settings: ViewSettings; onChange: (settings: ViewSettings) => void }) {
  const { settings, onChange } = props
  const service = useMachine(menu.machine, { id: "view", menubar: useContext(MenubarContext) })
  const api = menu.connect(service, normalizeProps)

  const checkboxes = [
    { value: "line-numbers", label: "Show line numbers", key: "lineNumbers" as const },
    { value: "word-wrap", label: "Word wrap", key: "wordWrap" as const },
  ]

  return (
    <>
      <button {...api.getTriggerProps()}>View</button>
      {api.open && (
        <Portal>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <div {...api.getListProps()}>
                {checkboxes.map((option) => {
                  const item = {
                    type: "checkbox" as const,
                    value: option.value,
                    checked: settings[option.key],
                    onCheckedChange: (checked: boolean) => onChange({ ...settings, [option.key]: checked }),
                  }
                  return (
                    <div key={option.value} {...api.getOptionItemProps(item)}>
                      <span className="check">
                        <span {...api.getItemIndicatorProps(item)}>✓</span>
                      </span>
                      <span {...api.getItemTextProps(item)}>{option.label}</span>
                    </div>
                  )
                })}
                <hr {...api.getSeparatorProps()} />
                <div {...api.getItemGroupProps({ id: "theme" })}>
                  <span {...api.getItemGroupLabelProps({ htmlFor: "theme" })}>Theme</span>
                  {themes.map((theme) => {
                    const item = {
                      type: "radio" as const,
                      value: theme,
                      checked: settings.theme === theme,
                      onCheckedChange: () => onChange({ ...settings, theme }),
                    }
                    return (
                      <div key={theme} {...api.getOptionItemProps(item)}>
                        <span className="check">
                          <span {...api.getItemIndicatorProps(item)}>✓</span>
                        </span>
                        <span {...api.getItemTextProps(item)}>{theme}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}

export default function Page() {
  const [lastAction, setLastAction] = useState("none")
  const [settings, setSettings] = useState<ViewSettings>({ lineNumbers: true, wordWrap: false, theme: "System" })

  const service = useMachine(menubar.machine, { id: useId() })
  const api = menubar.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="menubar-app-menu">
          <MenubarContext.Provider value={api.getMenuContext()}>
            <div {...api.getRootProps()}>
              <ActionMenu id="file" label="File" actions={fileActions} onRun={setLastAction} />
              <ActionMenu id="edit" label="Edit" actions={editActions} onRun={setLastAction} />
              <ViewMenu settings={settings} onChange={setSettings} />
            </div>
          </MenubarContext.Provider>
          <p className="status">Last action: {lastAction}</p>
          <p className="status">
            Line numbers {settings.lineNumbers ? "on" : "off"} · Word wrap {settings.wordWrap ? "on" : "off"} · Theme:{" "}
            {settings.theme}
          </p>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

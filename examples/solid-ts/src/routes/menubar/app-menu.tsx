import * as menu from "@zag-js/menu"
import * as menubar from "@zag-js/menubar"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { type Accessor, createContext, createMemo, createSignal, createUniqueId, For, Show, useContext } from "solid-js"
import { Portal } from "@solidjs/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/menu.css"

const MenubarContext = createContext<Accessor<menu.MenubarContext>>()

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
  const menubarContext = useContext(MenubarContext)
  const service = useMachine(menu.machine, (): menu.Props => ({
    id: props.id,
    menubar: menubarContext ? menubarContext() : undefined,
    onSelect: (details) => {
      const action = props.actions.find((item) => item.value === details.value)
      if (action) props.onRun(action.label)
    },
  }))
  const api = createMemo(() => menu.connect(service, normalizeProps))

  return (
    <>
      <button {...api().getTriggerProps()}>{props.label}</button>
      <Show when={api().open}>
        <Portal>
          <div {...api().getPositionerProps()}>
            <ul {...api().getContentProps()}>
              <For each={props.actions}>
                {(action) => (
                  <li {...api().getItemProps({ value: action.value, disabled: action.disabled })}>
                    {action.label}
                    <Show when={action.shortcut}>
                      <kbd class="shortcut">{action.shortcut}</kbd>
                    </Show>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </Portal>
      </Show>
    </>
  )
}

interface ViewSettings {
  lineNumbers: boolean
  wordWrap: boolean
  theme: string
}

const checkboxes = [
  { value: "line-numbers", label: "Show line numbers", key: "lineNumbers" as const },
  { value: "word-wrap", label: "Word wrap", key: "wordWrap" as const },
]

function ViewMenu(props: { settings: ViewSettings; onChange: (settings: ViewSettings) => void }) {
  const menubarContext = useContext(MenubarContext)
  const service = useMachine(menu.machine, () => ({
    id: "view",
    menubar: menubarContext ? menubarContext() : undefined,
  }))
  const api = createMemo(() => menu.connect(service, normalizeProps))

  const checkboxItem = (option: (typeof checkboxes)[number]) => ({
    type: "checkbox" as const,
    value: option.value,
    checked: props.settings[option.key],
    onCheckedChange: (checked: boolean) => props.onChange({ ...props.settings, [option.key]: checked }),
  })

  const themeItem = (theme: string) => ({
    type: "radio" as const,
    value: theme,
    checked: props.settings.theme === theme,
    onCheckedChange: () => props.onChange({ ...props.settings, theme }),
  })

  return (
    <>
      <button {...api().getTriggerProps()}>View</button>
      <Show when={api().open}>
        <Portal>
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <For each={checkboxes}>
                {(option) => (
                  <div {...api().getOptionItemProps(checkboxItem(option))}>
                    <span class="check">
                      <span {...api().getItemIndicatorProps(checkboxItem(option))}>✓</span>
                    </span>
                    <span {...api().getItemTextProps(checkboxItem(option))}>{option.label}</span>
                  </div>
                )}
              </For>
              <hr {...api().getSeparatorProps()} />
              <div {...api().getItemGroupProps({ id: "theme" })}>
                <span {...api().getItemGroupLabelProps({ htmlFor: "theme" })}>Theme</span>
                <For each={themes}>
                  {(theme) => (
                    <div {...api().getOptionItemProps(themeItem(theme))}>
                      <span class="check">
                        <span {...api().getItemIndicatorProps(themeItem(theme))}>✓</span>
                      </span>
                      <span {...api().getItemTextProps(themeItem(theme))}>{theme}</span>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>
        </Portal>
      </Show>
    </>
  )
}

export default function Page() {
  const [lastAction, setLastAction] = createSignal("none")
  const [settings, setSettings] = createSignal<ViewSettings>({ lineNumbers: true, wordWrap: false, theme: "System" })

  const service = useMachine(menubar.machine, { id: createUniqueId() })
  const api = createMemo(() => menubar.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="menubar-app-menu">
          <MenubarContext value={() => api().getMenuContext()}>
            <div {...api().getRootProps()}>
              <ActionMenu id="file" label="File" actions={fileActions} onRun={setLastAction} />
              <ActionMenu id="edit" label="Edit" actions={editActions} onRun={setLastAction} />
              <ViewMenu settings={settings()} onChange={setSettings} />
            </div>
          </MenubarContext>
          <p class="status">Last action: {lastAction()}</p>
          <p class="status">
            Line numbers {settings().lineNumbers ? "on" : "off"} · Word wrap {settings().wordWrap ? "on" : "off"} ·
            Theme: {settings().theme}
          </p>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

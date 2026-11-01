import * as combobox from "@zag-js/combobox"
import * as dialog from "@zag-js/dialog"
import { createHotkeyStore } from "@zag-js/hotkeys"
import { createFilter } from "@zag-js/i18n-utils"
import { commandData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, Show, createMemo, createSignal, createUniqueId, onCleanup, onMount } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/cmdk.css"

const { allItems, commands, applications, suggestions } = commandData
const { contains } = createFilter({ sensitivity: "base" })

function filter(value: string): Record<string, commandData.Command[]> {
  if (!value) {
    return {
      Suggestions: suggestions,
      Commands: commands.filter((item) => !suggestions.includes(item)),
      Apps: applications.filter((item) => !suggestions.includes(item)),
    }
  }

  const results = allItems.filter((item) => contains(item.name, value) || contains(item.title, value))

  if (!results.length) return {}

  return { Results: results }
}

interface ComboboxProps {
  matches: Record<string, commandData.Command[]>
  collection: ReturnType<typeof combobox.collection<commandData.Command>>
  onValueChange: combobox.Props["onValueChange"]
  onInputValueChange: combobox.Props["onInputValueChange"]
}

function Combobox(props: ComboboxProps) {
  const matchEntries = createMemo(() => Object.entries(props.matches))
  const id = createUniqueId()

  const service = useMachine(combobox.machine, (): combobox.Props<commandData.Command> => ({
    inline: true,
    placeholder: "Type a command or search term...",
    loopFocus: false,
    collection: props.collection,
    onValueChange: props.onValueChange,
    onInputValueChange: props.onInputValueChange,
    id,
    inputBehavior: "autohighlight",
    selectionBehavior: "clear",
  }))

  const comboApi = createMemo(() => combobox.connect(service, normalizeProps))

  return (
    <div {...comboApi().getRootProps()}>
      <input {...comboApi().getInputProps()} />
      <div {...comboApi().getContentProps()}>
        <div {...comboApi().getEmptyProps()}>{matchEntries().length === 0 && "No results found"}</div>
        <div {...comboApi().getListProps()}>
          <For each={matchEntries()}>
            {([group, items]) => (
              <div {...comboApi().getItemGroupProps({ id: group })}>
                <div {...comboApi().getItemGroupLabelProps({ htmlFor: group })}>{group}</div>
                <For each={items}>
                  {(item) => <div {...comboApi().getItemProps({ item, persistFocus: true })}>{item.title}</div>}
                </For>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  const [inputValue, setInputValue] = createSignal("")
  const [selectedAction, setSelectedAction] = createSignal<string | null>(null)

  const matches = createMemo(() => filter(inputValue()))

  const collection = createMemo(() =>
    combobox.collection({
      items: Object.values(matches()).flat(),
      itemToValue: (item) => item.name,
      itemToString: (item) => item.title,
    }),
  )

  const service = useMachine(dialog.machine, {
    id: createUniqueId(),
    onOpenChange({ open }) {
      if (!open) setInputValue("")
    },
  })
  const dialogApi = createMemo(() => dialog.connect(service, normalizeProps))

  onMount(() => {
    const store = createHotkeyStore()
    store.register({ id: "cmdk", hotkey: "/", action: () => dialogApi().setOpen(true) })
    store.init({ target: document })
    onCleanup(() => store.destroy())
  })

  return (
    <main>
      <button {...dialogApi().getTriggerProps()}>Open Command Menu</button>
      <p>
        or press <kbd>/</kbd>
      </p>

      <Show when={selectedAction()}>
        <div>
          <b>Selected Action:</b> {selectedAction()}
        </div>
      </Show>

      <Show when={dialogApi().open}>
        <Portal>
          <div {...dialogApi().getBackdropProps()} />
          <div {...dialogApi().getPositionerProps()}>
            <div {...dialogApi().getContentProps()}>
              <Combobox
                matches={matches()}
                collection={collection()}
                onValueChange={({ items }) => {
                  setSelectedAction(JSON.stringify(items[0].title))
                  dialogApi().setOpen(false)
                }}
                onInputValueChange={({ inputValue }) => {
                  setInputValue(inputValue)
                }}
              />
            </div>
          </div>
        </Portal>
      </Show>
    </main>
  )
}

import * as combobox from "@zag-js/combobox"
import * as dialog from "@zag-js/dialog"
import { createHotkeyStore } from "@zag-js/hotkeys"
import { createFilter } from "@zag-js/i18n-utils"
import { Portal, normalizeProps, useMachine } from "@zag-js/preact"
import { commandData } from "@zag-js/shared"
import { useEffect, useId, useMemo, useState } from "react"
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

function Combobox(props: Partial<combobox.Props> & { matches: Record<string, commandData.Command[]> }) {
  const { matches, ...context } = props
  const matchEntries = Object.entries(matches)

  const service = useMachine(combobox.machine, {
    inline: true,
    placeholder: "Type a command or search term...",
    loopFocus: false,
    ...context,
    id: useId(),
    inputBehavior: "autohighlight",
    selectionBehavior: "clear",
  })

  const comboApi = combobox.connect(service, normalizeProps)

  return (
    <div {...comboApi.getRootProps()}>
      <input {...comboApi.getInputProps()} />
      <div {...comboApi.getContentProps()}>
        <div {...comboApi.getEmptyProps()}>{matchEntries.length === 0 && "No results found"}</div>
        <div {...comboApi.getListProps()}>
          {matchEntries.map(([group, items]) => (
            <div key={group} {...comboApi.getItemGroupProps({ id: group })}>
              <div {...comboApi.getItemGroupLabelProps({ htmlFor: group })}>{group}</div>
              {items.map((item) => (
                <div key={item.name} {...comboApi.getItemProps({ item, persistFocus: true })}>
                  {item.title}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  const [inputValue, setInputValue] = useState("")
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

  const matches = useMemo(() => filter(inputValue), [inputValue])
  const flatMatches = Object.values(matches).flat()

  const collection = useMemo(
    () =>
      combobox.collection({
        items: flatMatches,
        itemToValue: (item) => item.name,
        itemToString: (item) => item.title,
      }),
    [flatMatches],
  )

  /* -----------------------------------------------------------------------------
   * Dialog machine
   * -----------------------------------------------------------------------------*/

  const service = useMachine(dialog.machine, {
    id: useId(),
    onOpenChange({ open }) {
      if (!open) setInputValue("")
    },
  })

  const dialogApi = dialog.connect(service, normalizeProps)

  useEffect(() => {
    const store = createHotkeyStore()
    store.register({ id: "cmdk", hotkey: "/", action: () => dialogApi.setOpen(true) })
    store.init({ target: document })
    return () => store.destroy()
  }, [dialogApi])

  /* -----------------------------------------------------------------------------
   * Render
   * -----------------------------------------------------------------------------*/

  return (
    <main>
      <button {...dialogApi.getTriggerProps()}>Open Command Menu</button>
      <p>
        or press <kbd>/</kbd>
      </p>

      {selectedAction && (
        <div>
          <b>Selected Action:</b> {selectedAction}
        </div>
      )}

      {dialogApi.open && (
        <Portal>
          <div {...dialogApi.getBackdropProps()} />
          <div {...dialogApi.getPositionerProps()}>
            <div {...dialogApi.getContentProps()}>
              <Combobox
                matches={matches}
                collection={collection}
                onValueChange={({ items }) => {
                  setSelectedAction(JSON.stringify(items[0].title))
                  dialogApi.setOpen(false)
                }}
                onInputValueChange={({ inputValue }) => {
                  setInputValue(inputValue)
                }}
              />
            </div>
          </div>
        </Portal>
      )}
    </main>
  )
}

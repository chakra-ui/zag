/**
 * Credits to AriaKit for the inspiration
 * https://ariakit.org/examples/dialog-combobox-command-menu
 */

import * as combobox from "@zag-js/combobox"
import * as dialog from "@zag-js/dialog"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { commandData } from "@zag-js/shared"
import { matchSorter } from "match-sorter"
import { useEffect, useId, useMemo, useState } from "react"

const { allItems, commands, applications, suggestions } = commandData

function filter(value: string): Record<string, commandData.Command[]> {
  if (!value) {
    return {
      Suggestions: suggestions,
      Commands: commands.filter((item) => !suggestions.includes(item)),
      Apps: applications.filter((item) => !suggestions.includes(item)),
    }
  }

  const results = matchSorter(allItems, value, {
    keys: ["name", "title"],
  })

  if (!results.length) return {}

  return { Results: results }
}

function Combobox(props: Omit<combobox.Context, "id"> & { matches: Record<string, commandData.Command[]> }) {
  const { matches, ...context } = props
  const matchEntries = Object.entries(matches)

  const [comboState, comboSend] = useMachine(
    combobox.machine({
      id: useId(),
      open: true,
      disableLayer: true,
      placeholder: "Type a command or search term...",
      inputBehavior: "autohighlight",
      selectionBehavior: "clear",
      loopFocus: false,
      ...context,
    }),
    { context },
  )

  const comboApi = combobox.connect(comboState, comboSend, normalizeProps)

  return (
    <div {...comboApi.rootProps} style={{ width: "100%" }}>
      <input {...comboApi.inputProps} style={{ marginBottom: "12px" }} />
      <div {...comboApi.contentProps} style={{ minHeight: "120px" }}>
        <div {...comboApi.listProps}>
          {matchEntries.length === 0 && <div>No results found</div>}
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

  const [dialogState, dialogSend] = useMachine(
    dialog.machine({
      id: useId(),
    }),
  )

  const dialogApi = dialog.connect(dialogState, dialogSend, normalizeProps)

  useEffect(() => {
    const fn = (event: KeyboardEvent) => {
      if (dialogApi.open) return

      const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator?.platform)
      const hotkey = isMac ? "metaKey" : "ctrlKey"

      if (event.key?.toLowerCase() === "k" && event[hotkey]) {
        event.preventDefault()
        dialogApi.setOpen(true)
      }
    }
    document.addEventListener("keydown", fn, true)
    return () => {
      document.removeEventListener("keydown", fn, true)
    }
  }, [dialogApi])

  /* -----------------------------------------------------------------------------
   * Render
   * -----------------------------------------------------------------------------*/

  return (
    <main>
      <button {...dialogApi.triggerProps}>Open Command Menu</button>
      <div style={{ background: "lightgray", padding: "12px" }}>
        or press <kbd> Cmd+K</kbd>
      </div>

      {selectedAction && (
        <div>
          <b>Selected Action:</b> {selectedAction}
        </div>
      )}

      {dialogApi.open && (
        <Portal>
          <div {...dialogApi.backdropProps} />
          <div {...dialogApi.positionerProps}>
            <div {...dialogApi.contentProps}>
              <Combobox
                matches={matches}
                collection={collection}
                onValueChange={({ items }) => {
                  setSelectedAction(JSON.stringify(items[0].title))
                  queueMicrotask(() => dialogApi.setOpen(false))
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

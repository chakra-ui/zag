import { PageListCollection } from "@zag-js/collection"
import * as combobox from "@zag-js/combobox"
import * as dialog from "@zag-js/dialog"
import { createFuzzySearch } from "@zag-js/fuzzy"
import { createHotkeyStore } from "@zag-js/hotkeys"
import { normalizeProps, Portal, useMachine } from "@zag-js/preact"
import { commandData } from "@zag-js/shared"
import { useEffect, useId, useMemo, useState } from "preact/hooks"
import { Highlight } from "../../components/highlight"
import "@styles/cmdk.css"

type Item = commandData.PageItem

const createCollection = () =>
  new PageListCollection<Item>({
    items: commandData.pageItems,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
    groupBy: (item) => item.group,
  })

const fuzzy = createFuzzySearch<Item>({ itemToString: (item) => item.label, itemToKeywords: (item) => item.keywords })

interface CommandProps {
  pages: PageListCollection<Item>
  query: string
  onNavigate: (pages: PageListCollection<Item>, query: string) => void
  onQueryChange: (query: string) => void
  onAction: (item: Item) => void
}

function Command(props: CommandProps) {
  const { pages, query } = props

  // search the open page and everything nested in it
  const collection = useMemo(
    () => pages.setItems(fuzzy.search(query ? pages.getDescendants() : pages.getChildren(), query)),
    [pages, query],
  )

  const service = useMachine(combobox.machine, {
    id: useId(),
    inline: true,
    collection,
    inputValue: query,
    placeholder: pages.pageItem ? `Search ${pages.pageItem.label}...` : "Type a command or search...",
    loopFocus: false,
    inputBehavior: "autohighlight",
    selectionBehavior: "clear",
    onInputValueChange({ inputValue }) {
      props.onQueryChange(inputValue)
    },
    onSelect({ itemValue }) {
      const item = pages.getItem(itemValue)
      if (!item) return
      if (pages.isPage(item)) {
        props.onNavigate(pages.setPage(itemValue, query), "")
      } else {
        props.onAction(item)
      }
    },
  })

  const api = combobox.connect(service, normalizeProps)

  // highlight the item we came back from once its page is showing
  const { highlightedValue } = pages.restore
  useEffect(() => {
    if (highlightedValue && collection.has(highlightedValue)) api.setHighlightedValue(highlightedValue)
  }, [pages])

  const groups = collection.group()
  const inputProps = api.getInputProps()

  return (
    <div {...api.getRootProps()}>
      {pages.page && (
        <div data-part="breadcrumbs">
          {pages.getPath().map((page) => (
            <span key={page.value}>{page.label}</span>
          ))}
        </div>
      )}
      <input
        {...inputProps}
        onKeyDown={(event) => {
          if (event.key === "Backspace" && !query && pages.page) {
            event.preventDefault()
            // keep the input empty so Backspace keeps going up
            props.onNavigate(pages.up(query), "")
            return
          }
          inputProps.onKeyDown?.(event)
        }}
      />
      <div {...api.getContentProps()}>
        <div {...api.getEmptyProps()}>{collection.size === 0 && "No results found"}</div>
        <div {...api.getListProps()}>
          {groups.map(([group, items]) => (
            <div key={group} {...api.getItemGroupProps({ id: group })}>
              <div {...api.getItemGroupLabelProps({ htmlFor: group })}>{group}</div>
              {items.map((item) => (
                <div key={item.value} {...api.getItemProps({ item, persistFocus: true })}>
                  <Highlight text={item.label} query={query} fuzzy />
                  {query && pages.getAncestors(item).length > 0 && (
                    <span data-part="item-path">
                      {pages
                        .getAncestors(item)
                        .map((page) => page.label)
                        .join(" › ")}
                    </span>
                  )}
                  {pages.isPage(item) && <span data-part="item-indicator">›</span>}
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
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [pages, setPages] = useState(createCollection)
  const [query, setQuery] = useState("")

  const navigate = (next: PageListCollection<Item>, nextQuery: string) => {
    setPages(next)
    setQuery(nextQuery)
  }

  const service = useMachine(dialog.machine, {
    id: useId(),
    onEscapeKeyDown(event) {
      // Escape goes back a page before it closes the dialog
      if (!pages.canGoBack) return
      event.preventDefault()
      const next = pages.back(query)
      navigate(next, next.restore.query)
    },
    onOpenChange({ open }) {
      if (!open) navigate(pages.reset(), "")
    },
  })
  const dialogApi = dialog.connect(service, normalizeProps)

  useEffect(() => {
    const store = createHotkeyStore()
    store.register({ id: "cmdk", hotkey: "/", action: () => dialogApi.setOpen(true) })
    store.init({ target: document })
    return () => store.destroy()
  }, [dialogApi])

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
              <Command
                pages={pages}
                query={query}
                onNavigate={navigate}
                onQueryChange={setQuery}
                onAction={(item) => {
                  setSelectedAction(item.label)
                  dialogApi.setOpen(false)
                }}
              />
            </div>
          </div>
        </Portal>
      )}
    </main>
  )
}

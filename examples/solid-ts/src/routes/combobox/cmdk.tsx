import { PageListCollection } from "@zag-js/collection"
import * as combobox from "@zag-js/combobox"
import * as dialog from "@zag-js/dialog"
import { createFuzzySearch } from "@zag-js/fuzzy"
import { createHotkeyStore } from "@zag-js/hotkeys"
import { commandData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, Show, createEffect, createMemo, createSignal, createUniqueId, on, onCleanup, onMount } from "solid-js"
import { Portal } from "solid-js/web"
import { Highlight } from "~/components/highlight"
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
  const id = createUniqueId()

  // search the open page and everything nested in it
  const collection = createMemo(() =>
    props.pages.setItems(
      fuzzy.search(props.query ? props.pages.getDescendants() : props.pages.getChildren(), props.query),
    ),
  )

  const service = useMachine(combobox.machine, () => ({
    id,
    inline: true,
    collection: collection(),
    inputValue: props.query,
    placeholder: props.pages.pageItem ? `Search ${props.pages.pageItem.label}...` : "Type a command or search...",
    loopFocus: false,
    inputBehavior: "autohighlight" as const,
    selectionBehavior: "clear" as const,
    onInputValueChange({ inputValue }: combobox.InputValueChangeDetails) {
      props.onQueryChange(inputValue)
    },
    onSelect({ itemValue }: combobox.SelectionDetails) {
      const item = props.pages.getItem(itemValue)
      if (!item) return
      if (props.pages.isPage(item)) {
        props.onNavigate(props.pages.setPage(itemValue, props.query), "")
      } else {
        props.onAction(item)
      }
    },
  }))

  const api = createMemo(() => combobox.connect(service, normalizeProps))

  // highlight the item we came back from once its page is showing
  createEffect(
    on(
      () => props.pages,
      (pages) => {
        const { highlightedValue } = pages.restore
        if (highlightedValue && collection().has(highlightedValue)) api().setHighlightedValue(highlightedValue)
      },
      { defer: true },
    ),
  )

  const inputProps = createMemo(() => api().getInputProps())

  return (
    <div {...api().getRootProps()}>
      <Show when={props.pages.page}>
        <div data-part="breadcrumbs">
          <For each={props.pages.getPath()}>{(page) => <span>{page.label}</span>}</For>
        </div>
      </Show>
      <input
        {...inputProps()}
        onKeyDown={(event) => {
          if (event.key === "Backspace" && !props.query && props.pages.page) {
            event.preventDefault()
            const next = props.pages.up(props.query)
            props.onNavigate(next, next.restore.query)
            return
          }
          const handler = inputProps().onKeyDown
          if (typeof handler === "function") handler(event)
        }}
      />
      <div {...api().getContentProps()}>
        <div {...api().getEmptyProps()}>{collection().size === 0 && "No results found"}</div>
        <div {...api().getListProps()}>
          <For each={collection().group()}>
            {([group, items]) => (
              <div {...api().getItemGroupProps({ id: group })}>
                <div {...api().getItemGroupLabelProps({ htmlFor: group })}>{group}</div>
                <For each={items}>
                  {(item) => (
                    <div {...api().getItemProps({ item, persistFocus: true })}>
                      <Highlight text={item.label} query={props.query} />
                      <Show when={props.query && props.pages.getAncestors(item).length > 0}>
                        <span data-part="item-path">
                          {props.pages
                            .getAncestors(item)
                            .map((page) => page.label)
                            .join(" › ")}
                        </span>
                      </Show>
                      <Show when={props.pages.isPage(item)}>
                        <span data-part="item-indicator">›</span>
                      </Show>
                    </div>
                  )}
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
  const [selectedAction, setSelectedAction] = createSignal<string | null>(null)
  const [pages, setPages] = createSignal(createCollection())
  const [query, setQuery] = createSignal("")

  const navigate = (next: PageListCollection<Item>, nextQuery: string) => {
    setPages(next)
    setQuery(nextQuery)
  }

  const service = useMachine(dialog.machine, {
    id: createUniqueId(),
    onEscapeKeyDown(event) {
      // Escape goes back a page before it closes the dialog
      if (!pages().canGoBack) return
      event.preventDefault()
      const next = pages().back(query())
      navigate(next, next.restore.query)
    },
    onOpenChange({ open }) {
      if (!open) navigate(pages().reset(), "")
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
              <Command
                pages={pages()}
                query={query()}
                onNavigate={navigate}
                onQueryChange={setQuery}
                onAction={(item) => {
                  setSelectedAction(item.label)
                  dialogApi().setOpen(false)
                }}
              />
            </div>
          </div>
        </Portal>
      </Show>
    </main>
  )
}

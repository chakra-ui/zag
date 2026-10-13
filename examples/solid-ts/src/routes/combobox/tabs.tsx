import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as tabs from "@zag-js/tabs"
import { For, Index, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/combobox.css"
import "@styles/tabs.css"

const pages = {
  Page: [
    { value: "docs", label: "Docs" },
    { value: "examples", label: "Examples" },
    { value: "blog", label: "Blog" },
    { value: "community", label: "Community" },
    { value: "support", label: "Support" },
    { value: "contact", label: "Contact" },
    { value: "about", label: "About" },
    { value: "pricing", label: "Pricing" },
    { value: "login", label: "Login" },
    { value: "signup", label: "Signup" },
  ],
  Component: [
    { value: "select-tabs", label: "Select Tabs" },
    { value: "select-combobox", label: "Select Combobox" },
    { value: "combobox-tabs", label: "Combobox Tabs" },
    { value: "menu-button", label: "Menu Button" },
    { value: "menu-tabs", label: "Menu Tabs" },
    { value: "menu-combobox", label: "Menu Combobox" },
  ],
}

const flatPages = Object.entries(pages).flatMap(([category, pages]) => pages.map((page) => ({ ...page, category })))

function groupBy<T>(items: T[], key: keyof T): any {
  return items.reduce((acc: any, item) => {
    const value = item[key]
    if (!acc[value]) acc[value] = []
    acc[value].push(item)
    return acc
  }, {})
}

type SelectedTab = "Page" | "Component" | "All"
const categories: SelectedTab[] = ["All", "Page", "Component"]
const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [selectedTab, setSelectedTab] = createSignal<SelectedTab>("All")
  const [inputValue, setInputValue] = createSignal("")

  const matches = createMemo(() => {
    const allMatches = flatPages.filter((item) => contains(item.label, inputValue()))
    const groups = groupBy(allMatches, "category")
    groups.All = allMatches
    return groups as Record<SelectedTab, typeof flatPages>
  })

  let selectedValueTab: SelectedTab = "Component"

  const items = createMemo(() => matches()[selectedTab()] || [])
  const collection = createMemo(() => combobox.collection({ items: items() }))

  const comboboxId = createUniqueId()

  const service = useMachine(combobox.machine, (): combobox.Props => ({
    collection: collection(),
    id: comboboxId,
    popupType: "dialog",
    openOnClick: true,
    inputBehavior: "autohighlight",
    positioning: {
      sameWidth: false,
    },
    onValueChange() {
      selectedValueTab = selectedTab()
    },
    onInputValueChange(details) {
      setInputValue(details.inputValue)
    },
    onOpenChange(details) {
      if (details.open) return
      setInputValue("")
      if (selectedValueTab === selectedTab()) return
      setSelectedTab(selectedValueTab)
    },
  }))

  const comboboxApi = createMemo(() => combobox.connect(service, normalizeProps))

  const tabsId = createUniqueId()

  const tabService = useMachine(tabs.machine, (): tabs.Props => ({
    id: tabsId,
    virtualFocus: true,
    value: selectedTab(),
    onValueChange(details) {
      setSelectedTab(details.value as SelectedTab)
    },
  }))

  const tabApi = createMemo(() => tabs.connect(tabService, normalizeProps))

  return (
    <main>
      <div {...comboboxApi().getRootProps()}>
        <pre>{comboboxApi().value}</pre>
        <label {...comboboxApi().getLabelProps()}>Select country </label>
        <div {...comboboxApi().getControlProps()}>
          <input
            {...mergeProps(() => comboboxApi().getInputProps(), {
              onKeyDown(event: KeyboardEvent) {
                if (!comboboxApi().open) return

                if (event.key === "ArrowRight") {
                  tabApi().selectNext()
                  event.preventDefault()
                }

                if (event.key === "ArrowLeft") {
                  tabApi().selectPrev()
                  event.preventDefault()
                }
              },
            })}
          />
          <button {...comboboxApi().getTriggerProps()}>▼</button>
        </div>
      </div>
      <div {...comboboxApi().getPositionerProps()}>
        <div {...comboboxApi().getContentProps()}>
          <div {...mergeProps(() => tabApi().getRootProps(), { style: { position: "relative" } })}>
            <div
              data-stretch=""
              {...mergeProps(() => tabApi().getListProps(), {
                style: { position: "sticky", top: "0", "inset-inline": "0" },
              })}
            >
              <For each={categories}>
                {(category) => {
                  const currentItems = () => matches()[category]
                  return (
                    <button {...tabApi().getTriggerProps({ value: category, disabled: !currentItems()?.length })}>
                      {category} ({currentItems()?.length || 0})
                    </button>
                  )
                }}
              </For>
            </div>

            <Show when={!items().length}>
              <div class="no-results">
                No item found for &quot;<strong>{inputValue()}</strong>
                &quot;
              </div>
            </Show>

            <For each={categories}>
              {(category) => (
                <div {...tabApi().getContentProps({ value: category })}>
                  <Show when={selectedTab() === category}>
                    <div {...comboboxApi().getListProps()}>
                      <Index each={items()}>
                        {(item) => (
                          <div {...comboboxApi().getItemProps({ item: item(), persistFocus: true })}>
                            {item().label}
                          </div>
                        )}
                      </Index>
                    </div>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </main>
  )
}

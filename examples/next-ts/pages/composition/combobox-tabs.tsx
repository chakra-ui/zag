import * as combobox from "@zag-js/combobox"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as tabs from "@zag-js/tabs"
import { matchSorter } from "match-sorter"
import { useId, useMemo, useRef, useState } from "react"
import { flushSync } from "react-dom"

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

export default function Page() {
  const [selectedTab, setSelectedTab] = useState<SelectedTab>("All")
  const [inputValue, setInputValue] = useState("")

  const matches = useMemo(() => {
    const allMatches = matchSorter(flatPages, inputValue, { keys: ["label"] })
    const groups = groupBy(allMatches, "category")
    groups.All = allMatches
    return groups as Record<SelectedTab, typeof flatPages>
  }, [inputValue])

  const selectedValueTab = useRef<SelectedTab>("Component")

  const items = useMemo(() => matches[selectedTab] || [], [matches, selectedTab])
  const collection = useMemo(() => combobox.collection({ items }), [items])

  const [comboboxState, comboboxSend] = useMachine(
    combobox.machine({
      collection,
      id: useId(),
      composite: false,
      openOnClick: true,
      inputBehavior: "autohighlight",
      positioning: {
        sameWidth: false,
      },
    }),
    {
      context: {
        collection,
        onValueChange() {
          selectedValueTab.current = selectedTab
        },
        onInputValueChange(details) {
          flushSync(() => {
            setInputValue(details.inputValue)
          })
        },
        onOpenChange(details) {
          if (details.open) return
          setInputValue("")
          if (selectedValueTab.current === selectedTab) return
          setSelectedTab(selectedValueTab.current)
        },
      },
    },
  )

  const comboboxApi = combobox.connect(comboboxState, comboboxSend, normalizeProps)

  const [tabState, tabSend] = useMachine(tabs.machine({ id: useId() }), {
    context: {
      composite: false,
      value: selectedTab,
      onValueChange(details) {
        setSelectedTab(details.value as SelectedTab)
      },
    },
  })

  const tabApi = tabs.connect(tabState, tabSend, normalizeProps)

  return (
    <main>
      <div {...comboboxApi.getRootProps()}>
        <pre>{comboboxApi.value}</pre>
        <label {...comboboxApi.getLabelProps()}>Select country </label>
        <div {...comboboxApi.getControlProps()}>
          <input
            {...mergeProps(comboboxApi.getInputProps(), {
              onKeyDown(event) {
                if (!comboboxApi.open) return

                if (event.key === "ArrowRight") {
                  tabApi.selectNext()
                  event.preventDefault()
                }

                if (event.key === "ArrowLeft") {
                  tabApi.selectPrev()
                  event.preventDefault()
                }
              },
            })}
          />
          <button {...comboboxApi.getTriggerProps()}>▼</button>
        </div>
      </div>
      <div {...comboboxApi.getPositionerProps()}>
        <ul {...comboboxApi.getContentProps()}>
          <div {...tabApi.getRootProps()} style={{ position: "relative" }}>
            <div {...tabApi.getListProps()} style={{ position: "sticky", top: "0", insetInline: "0" }}>
              {categories.map((category) => {
                const currentItems = matches[category]
                return (
                  <button
                    key={category}
                    {...tabApi.getTriggerProps({ value: category, disabled: !currentItems?.length })}
                  >
                    {category} ({currentItems?.length || 0})
                  </button>
                )
              })}
            </div>

            {!items.length && (
              <div className="no-results">
                No item found for &quot;<strong>{inputValue}</strong>
                &quot;
              </div>
            )}

            {categories.map((category) => (
              <div key={category} {...tabApi.getContentProps({ value: category })}>
                {selectedTab === category && (
                  <div {...comboboxApi.getListProps()}>
                    {items.map((item) => (
                      <li key={item.value} {...comboboxApi.getItemProps({ item, persistFocus: true })}>
                        {item.label}
                      </li>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ul>
      </div>
    </main>
  )
}

import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import * as tabs from "@zag-js/tabs"
import { GitBranchIcon, TagIcon } from "lucide-react"
import { useEffect, useId, useMemo, useRef, useState } from "react"
import { flushSync } from "react-dom"

const branchData = [
  { value: "master", label: "master" },
  { value: "feature", label: "feature" },
  { value: "bugfix", label: "bugfix" },
  { value: "hotfix", label: "hotfix" },
  { value: "release", label: "release" },
  { value: "rsc", label: "rsc" },
]

const tagData = [
  { value: "v1.0.0", label: "v1.0.0" },
  { value: "v1.0.1", label: "v1.0.1" },
  { value: "v1.0.2", label: "v1.0.2" },
  { value: "v1.0.3", label: "v1.0.3" },
  { value: "v1.0.4", label: "v1.0.4" },
  { value: "v1.0.5", label: "v1.0.5" },
]

type SelectedTab = "branch" | "tag"

export default function Page() {
  const [selectedTab, setSelectedTab] = useState<SelectedTab>("branch")
  const [highlighted, setHighlighted] = useState(new Map<SelectedTab, string>())
  const items = selectedTab === "branch" ? branchData : tagData

  const selectedValueTab = useRef<SelectedTab>("branch")

  const collection = useMemo(() => select.collection({ items }), [items])

  const [selectState, selectSend] = useMachine(
    select.machine({
      collection,
      id: useId(),
      composite: false,
    }),
    {
      context: {
        highlightedValue: highlighted.get(selectedTab),
        collection,
        onHighlightChange(details) {
          flushSync(() => {
            setHighlighted((prev) => new Map(prev).set(selectedTab, details.highlightedValue))
          })
        },
        onValueChange() {
          selectedValueTab.current = selectedTab
        },
        onOpenChange(details) {
          if (details.open) return
          if (selectedValueTab.current === selectedTab) return
          setSelectedTab(selectedValueTab.current)
        },
      },
    },
  )

  const selectApi = select.connect(selectState, selectSend, normalizeProps)

  const [tabState, tabSend] = useMachine(tabs.machine({ id: useId() }), {
    context: {
      value: selectedTab,
      onValueChange(details) {
        const nextTab = details.value as SelectedTab
        setHighlighted((prev) => new Map(prev).set(nextTab, highlighted.get(nextTab) || null))
        setSelectedTab(nextTab)
      },
    },
  })

  const tabApi = tabs.connect(tabState, tabSend, normalizeProps)

  useEffect(() => {
    if (!selectApi.open) return
    tabApi.syncTabIndex()
  }, [selectApi.open, tabApi])

  return (
    <main className="select">
      <div {...selectApi.rootProps}>
        <div {...selectApi.controlProps}>
          <button {...selectApi.triggerProps}>
            {selectedTab === "branch" ? <GitBranchIcon /> : <TagIcon />}
            <span>{selectApi.valueAsString || "Select option"}</span>
            <span {...selectApi.indicatorProps}>▼</span>
          </button>
        </div>

        <Portal>
          <div {...selectApi.positionerProps}>
            <ul {...selectApi.contentProps}>
              <div {...tabApi.rootProps}>
                <div {...tabApi.listProps}>
                  <button {...tabApi.getTriggerProps({ value: "branch" })}>Branch</button>
                  <button {...tabApi.getTriggerProps({ value: "tag" })}>Tags</button>
                </div>

                <div {...tabApi.getContentProps({ value: "branch" })}>
                  {selectedTab === "branch" && (
                    <div {...selectApi.listProps}>
                      {items.map((item) => (
                        <li key={item.value} {...selectApi.getItemProps({ item, persistFocus: true })}>
                          {item.label}
                        </li>
                      ))}
                    </div>
                  )}
                </div>

                <div {...tabApi.getContentProps({ value: "tag" })}>
                  {selectedTab === "tag" && (
                    <div {...selectApi.listProps}>
                      {items.map((item) => (
                        <li key={item.value} {...selectApi.getItemProps({ item, persistFocus: true })}>
                          {item.label}
                        </li>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ul>
          </div>
        </Portal>
      </div>
    </main>
  )
}

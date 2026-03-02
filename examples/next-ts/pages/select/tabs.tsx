import { Portal, mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import * as tabs from "@zag-js/tabs"
import { GitBranchIcon, TagIcon } from "lucide-react"
import { useEffect, useId, useMemo, useState } from "react"

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
  const [highlighted, setHighlighted] = useState<string | null>(null)

  const collection = useMemo(
    () => select.collection({ items: selectedTab === "branch" ? branchData : tagData }),
    [selectedTab],
  )

  const selectService = useMachine(select.machine, {
    collection,
    id: useId(),
    composite: false,
    highlightedValue: highlighted,
    onHighlightChange({ highlightedValue }) {
      setHighlighted(highlightedValue)
    },
    onValueChange() {
      setSelectedTab(selectedTab)
    },
    onOpenChange(details) {
      if (details.open) return
      setSelectedTab(selectedTab)
    },
  })

  const selectApi = select.connect(selectService, normalizeProps)

  const tabService = useMachine(tabs.machine, {
    id: useId(),
    value: selectedTab,
    onValueChange(details) {
      setSelectedTab(details.value as SelectedTab)
    },
  })

  const tabApi = tabs.connect(tabService, normalizeProps)

  useEffect(() => {
    if (!selectApi.open) return
    tabApi.syncTabIndex()
  }, [selectApi.open, tabApi])

  useEffect(() => {
    if (!selectApi.open) return
    selectApi.highlightValue(collection.firstValue!)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection])

  return (
    <main className="select">
      <div {...selectApi.getRootProps()}>
        <div {...selectApi.getControlProps()}>
          <button {...selectApi.getTriggerProps()}>
            {selectedTab === "branch" ? <GitBranchIcon /> : <TagIcon />}
            <span>{selectApi.valueAsString || "Select option"}</span>
            <span {...selectApi.getIndicatorProps()}>▼</span>
          </button>
        </div>

        <Portal>
          <div {...selectApi.getPositionerProps()}>
            <ul {...selectApi.getContentProps()}>
              <div {...tabApi.getRootProps()}>
                <div
                  {...mergeProps(tabApi.getListProps(), {
                    onKeyDown(event) {
                      if (event.key === "Home" || event.key === "End") {
                        event.preventDefault()
                      }
                    },
                  })}
                >
                  <button {...tabApi.getTriggerProps({ value: "branch" })}>Branch</button>
                  <button {...tabApi.getTriggerProps({ value: "tag" })}>Tags</button>
                </div>

                <div {...tabApi.getContentProps({ value: "branch" })}>
                  {selectedTab === "branch" && (
                    <div {...selectApi.getListProps()}>
                      {branchData.map((item) => (
                        <li key={item.value} {...selectApi.getItemProps({ item, persistFocus: true })}>
                          {item.label}
                        </li>
                      ))}
                    </div>
                  )}
                </div>

                <div {...tabApi.getContentProps({ value: "tag" })}>
                  {selectedTab === "tag" && (
                    <div {...selectApi.getListProps()}>
                      {tagData.map((item) => (
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

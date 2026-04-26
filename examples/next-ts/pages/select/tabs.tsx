import { Portal, mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import * as tabs from "@zag-js/tabs"
import { GitBranchIcon, TagIcon } from "lucide-react"
import { useEffect, useId, useMemo, useRef, useState } from "react"

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

  const listRef = useRef<HTMLDivElement>(null)
  const selectService = useMachine(select.machine, {
    collection,
    id: useId(),
    highlightedValue: highlighted,
    initialFocusEl: () => listRef.current,
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
    virtualFocus: true,
    onValueChange(details) {
      setSelectedTab(details.value as SelectedTab)
    },
  })

  const tabApi = tabs.connect(tabService, normalizeProps)

  useEffect(() => {
    if (!selectApi.open) return
    selectApi.setHighlightValue(collection.firstValue!)
    listRef.current?.focus()
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
            <div {...selectApi.getContentProps({ role: "dialog" })}>
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
                    <div
                      ref={listRef}
                      {...mergeProps(selectApi.getListProps(), {
                        onKeyDown(event) {
                          if (event.key === "ArrowLeft") tabApi.selectPrev()
                          else if (event.key === "ArrowRight") tabApi.selectNext()
                          else return
                          event.preventDefault()
                        },
                      })}
                    >
                      {branchData.map((item) => (
                        <div key={item.value} {...selectApi.getItemProps({ item, persistFocus: true })}>
                          {item.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div {...tabApi.getContentProps({ value: "tag" })}>
                  {selectedTab === "tag" && (
                    <div
                      ref={listRef}
                      {...mergeProps(selectApi.getListProps(), {
                        onKeyDown(event) {
                          if (event.key === "ArrowLeft") tabApi.selectPrev()
                          else if (event.key === "ArrowRight") tabApi.selectNext()
                          else return
                          event.preventDefault()
                        },
                      })}
                    >
                      {tagData.map((item) => (
                        <div key={item.value} {...selectApi.getItemProps({ item, persistFocus: true })}>
                          {item.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Portal>
      </div>
    </main>
  )
}

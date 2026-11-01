import * as select from "@zag-js/select"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as tabs from "@zag-js/tabs"
import { ChevronsUpDownIcon, GitBranchIcon, TagIcon } from "lucide-solid"
import { createEffect, createMemo, createSignal, createUniqueId, For, on, Show } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/select.css"
import "@styles/tabs.css"

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
  const [selectedTab, setSelectedTab] = createSignal<SelectedTab>("branch")
  const [highlighted, setHighlighted] = createSignal<string | null>(null)

  const collection = createMemo(() => select.collection({ items: selectedTab() === "branch" ? branchData : tagData }))

  let listRef: HTMLDivElement | undefined
  const selectId = createUniqueId()
  const tabsId = createUniqueId()

  const selectService = useMachine(select.machine, (): select.Props => ({
    collection: collection(),
    id: selectId,
    popupType: "dialog",
    highlightedValue: highlighted(),
    initialFocusEl: () => listRef ?? null,
    onHighlightChange({ highlightedValue }) {
      setHighlighted(highlightedValue)
    },
    onValueChange() {
      setSelectedTab(selectedTab())
    },
    onOpenChange(details) {
      if (details.open) return
      setSelectedTab(selectedTab())
    },
  }))

  const selectApi = createMemo(() => select.connect(selectService, normalizeProps))

  const tabService = useMachine(tabs.machine, () => ({
    id: tabsId,
    value: selectedTab(),
    virtualFocus: true,
    onValueChange(details) {
      setSelectedTab(details.value as SelectedTab)
    },
  }))

  const tabApi = createMemo(() => tabs.connect(tabService, normalizeProps))

  createEffect(
    on(
      collection,
      (collection) => {
        if (!selectApi().open) return
        selectApi().setHighlightedValue(collection.firstValue)
        listRef?.focus()
      },
      { defer: true },
    ),
  )

  const listProps = () =>
    mergeProps(selectApi().getListProps(), {
      onKeyDown(event: KeyboardEvent) {
        if (event.key === "ArrowLeft") tabApi().selectPrevious()
        else if (event.key === "ArrowRight") tabApi().selectNext()
        else return
        event.preventDefault()
      },
    })

  return (
    <main class="select">
      <div {...selectApi().getRootProps()}>
        <div {...selectApi().getControlProps()}>
          <button {...selectApi().getTriggerProps()}>
            <Show when={selectedTab() === "branch"} fallback={<TagIcon />}>
              <GitBranchIcon />
            </Show>
            <span>{selectApi().valueAsString || "Select option"}</span>
            <span {...selectApi().getIndicatorProps()}>
              <ChevronsUpDownIcon />
            </span>
          </button>
        </div>

        <Portal>
          <div {...selectApi().getPositionerProps()}>
            <div {...selectApi().getContentProps()}>
              <div {...tabApi().getRootProps()}>
                <div
                  data-stretch=""
                  {...mergeProps(tabApi().getListProps(), {
                    onKeyDown(event: KeyboardEvent) {
                      if (event.key === "Home" || event.key === "End") {
                        event.preventDefault()
                      }
                    },
                  })}
                >
                  <button {...tabApi().getTriggerProps({ value: "branch" })}>Branch</button>
                  <button {...tabApi().getTriggerProps({ value: "tag" })}>Tags</button>
                </div>

                <div {...tabApi().getContentProps({ value: "branch" })}>
                  <Show when={selectedTab() === "branch"}>
                    <div ref={listRef} {...listProps()}>
                      <For each={branchData}>
                        {(item) => (
                          <div {...selectApi().getItemProps({ item, persistFocus: true })}>
                            <span {...selectApi().getItemTextProps({ item })}>{item.label}</span>
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>

                <div {...tabApi().getContentProps({ value: "tag" })}>
                  <Show when={selectedTab() === "tag"}>
                    <div ref={listRef} {...listProps()}>
                      <For each={tagData}>
                        {(item) => (
                          <div {...selectApi().getItemProps({ item, persistFocus: true })}>
                            <span {...selectApi().getItemTextProps({ item })}>{item.label}</span>
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      </div>
    </main>
  )
}

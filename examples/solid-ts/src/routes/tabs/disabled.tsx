import { normalizeProps, useMachine } from "@zag-js/solid"
import * as tabs from "@zag-js/tabs"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import { tabsData } from "@zag-js/shared"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/tabs.css"

export default function Page() {
  const [disabled, setDisabled] = createSignal(false)
  const [addedTabs, setAddedTabs] = createSignal<typeof tabsData>([])
  const items = () => [...tabsData, ...addedTabs()]

  const service = useMachine(tabs.machine, {
    id: createUniqueId(),
    defaultValue: "nils",
  })

  const api = createMemo(() => tabs.connect(service, normalizeProps))

  const addTab = () => {
    const n = addedTabs().length + 1
    const tab = { id: `tab-${n}`, label: `Tab ${n}`, content: `Content of tab ${n}` }
    setAddedTabs([...addedTabs(), tab])
    api().setValue(tab.id)
  }

  return (
    <>
      <main class="tabs">
        <div {...api().getRootProps()}>
          <div {...api().getIndicatorProps()} />

          <div {...api().getListProps()}>
            <For each={items()}>
              {(item) => (
                <button
                  data-testid={`${item.id}-tab`}
                  {...api().getTriggerProps({ value: item.id, disabled: item.id === "nils" && disabled() })}
                >
                  {item.label}
                </button>
              )}
            </For>
          </div>

          <For each={items()}>
            {(item) => (
              <div data-testid={`${item.id}-tab-panel`} {...api().getContentProps({ value: item.id })}>
                <p>{item.content}</p>
              </div>
            )}
          </For>
        </div>
        <label>
          <input
            type="checkbox"
            data-testid="disable-selected"
            checked={disabled()}
            onChange={(e) => setDisabled(e.currentTarget.checked)}
          />
          Disable the selected tab
        </label>
        <button onClick={addTab}>Add a tab</button>
      </main>

      <Toolbar>
        <StateVisualizer state={service} context={["value", "tabStopValue"]} />
      </Toolbar>
    </>
  )
}

import { normalizeProps, useMachine } from "@zag-js/preact"
import { tabsData } from "@zag-js/shared"
import * as tabs from "@zag-js/tabs"
import { useId, useState } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/tabs.css"

export default function Page() {
  const [disabled, setDisabled] = useState(false)

  const service = useMachine(tabs.machine, {
    id: useId(),
    defaultValue: "nils",
  })

  const api = tabs.connect(service, normalizeProps)

  return (
    <>
      <main className="tabs">
        <div {...api.getRootProps()}>
          <div {...api.getIndicatorProps()} />
          <div {...api.getListProps()}>
            {tabsData.map((data) => (
              <button
                key={data.id}
                {...api.getTriggerProps({ value: data.id, disabled: data.id === "nils" && disabled })}
                data-testid={`${data.id}-tab`}
              >
                {data.label}
              </button>
            ))}
          </div>
          {tabsData.map((data) => (
            <div key={data.id} {...api.getContentProps({ value: data.id })} data-testid={`${data.id}-tab-panel`}>
              <p>{data.content}</p>
            </div>
          ))}
        </div>
        <label>
          <input
            type="checkbox"
            data-testid="disable-selected"
            checked={disabled}
            onChange={(e) => setDisabled(e.currentTarget.checked)}
          />
          Disable the selected tab
        </label>
      </main>
      <Toolbar>
        <StateVisualizer state={service} context={["value", "tabStopValue"]} />
      </Toolbar>
    </>
  )
}

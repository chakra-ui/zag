import { normalizeProps, useMachine } from "@zag-js/react"
import { tabsControls, tabsData } from "@zag-js/shared"
import * as tabs from "@zag-js/tabs"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(tabsControls)

  const service = useMachine(tabs.machine, {
    id: useId(),
    defaultValue: "nils",
    ...controls.context,
  })

  const api = tabs.connect(service, normalizeProps)

  return (
    <>
      <main className="tabs">
        <div {...api.getRootProps()}>
          <div {...api.getIndicatorProps()} />
          <div {...api.getListProps()}>
            {tabsData.map((data) => (
              <button {...api.getTriggerProps({ value: data.id })} key={data.id} data-testid={`${data.id}-tab`}>
                {data.label}
              </button>
            ))}
          </div>
          {tabsData.map((data) => (
            <div {...api.getContentProps({ value: data.id })} key={data.id} data-testid={`${data.id}-tab-panel`}>
              <p>{data.content}</p>
              {data.id === "agnes" ? <input placeholder="Agnes" /> : null}
            </div>
          ))}
        </div>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

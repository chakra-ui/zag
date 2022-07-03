import { Global } from "@emotion/react"
import { normalizeProps, useMachine, useSetup } from "@zag-js/react"
import { tabsControls, tabsData, tabsStyle } from "@zag-js/shared"
import * as tabs from "@zag-js/tabs"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(tabsControls)

  const [state, send] = useMachine(tabs.machine({ value: "nils" }), {
    context: controls.context,
  })

  const ref = useSetup({ send, id: useId() })

  const api = tabs.connect(state, send, normalizeProps)

  return (
    <>
      <Global styles={tabsStyle} />

      <main>
        <div {...api.rootProps}>
          <div {...api.indicatorProps} />
          <div ref={ref} {...api.triggerGroupProps}>
            {tabsData.map((data) => (
              <button {...api.getTriggerProps({ value: data.id })} key={data.id} data-testid={`${data.id}-tab`}>
                {data.label}
              </button>
            ))}
          </div>
          <div {...api.contentGroupProps}>
            {tabsData.map((data) => (
              <div {...api.getContentProps({ value: data.id })} key={data.id} data-testid={`${data.id}-tab-panel`}>
                <p>{data.content}</p>
                {data.id === "agnes" ? <input placeholder="Agnes" /> : null}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}

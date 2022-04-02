import { Global } from "@emotion/react"
import { useMachine, useSetup } from "@ui-machines/react"
import * as Tabs from "@ui-machines/tabs"
import { tabsControls } from "../../../shared/controls"
import { tabsData } from "../../../shared/data"
import { tabsStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(tabsControls)

  const [state, send] = useMachine(Tabs.machine.withContext({ value: "nils" }), {
    context: controls.context,
  })

  const ref = useSetup<HTMLDivElement>({ send, id: "1" })

  const api = Tabs.connect(state, send)

  return (
    <>
      <Global styles={tabsStyle} />
      <controls.ui />
      <div className="tabs" {...api.rootProps}>
        <div className="tabs__indicator" {...api.tabIndicatorProps} />
        <div ref={ref} {...api.tablistProps}>
          {tabsData.map((data) => (
            <button {...api.getTabProps({ value: data.id })} key={data.id} data-testid={`${data.id}-tab`}>
              {data.label}
            </button>
          ))}
        </div>
        {tabsData.map((data) => (
          <div {...api.getTabPanelProps({ value: data.id })} key={data.id} data-testid={`${data.id}-tab-panel`}>
            <p>{data.content}</p>
            {data.id === "agnes" ? <input placeholder="Agnes" /> : null}
          </div>
        ))}
      </div>

      <StateVisualizer state={state} />
    </>
  )
}

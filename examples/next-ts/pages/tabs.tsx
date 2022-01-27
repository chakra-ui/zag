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

  const { getTabProps, getTabPanelProps, tablistProps, tabIndicatorProps } = Tabs.connect(state, send)

  return (
    <div style={{ width: "100%" }}>
      <Global styles={tabsStyle} />
      <controls.ui />
      <div className="tabs">
        <div className="tabs__indicator" {...tabIndicatorProps} />
        <div ref={ref} {...tablistProps}>
          {tabsData.map((data) => (
            <button {...getTabProps({ value: data.id })} key={data.id} data-testid={`${data.id}-tab`}>
              {data.label}
            </button>
          ))}
        </div>
        {tabsData.map((data) => (
          <div {...getTabPanelProps({ value: data.id })} key={data.id} data-testid={`${data.id}-tab-panel`}>
            <p>{data.content}</p>
          </div>
        ))}
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}

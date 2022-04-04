import { Global } from "@emotion/react"
import { useMachine, useSetup } from "@ui-machines/react"
import * as tabs from "@ui-machines/tabs"
import { tabsControls } from "../../../shared/controls"
import { tabsData } from "../../../shared/data"
import { tabsStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(tabsControls)

  const [state, send] = useMachine(tabs.machine.withContext({ value: "nils" }), {
    context: controls.context,
  })

  const ref = useSetup<HTMLDivElement>({ send, id: "1" })

  const api = tabs.connect(state, send)

  return (
    <>
      <Global styles={tabsStyle} />
      <controls.ui />

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

      <StateVisualizer state={state} />
    </>
  )
}

import { useMachine, useSnapshot } from "@ui-machines/react"
import { tooltip } from "@ui-machines/web"
import { useMount } from "hooks/use-mount"

const Tooltip = (props: { id?: string }) => {
  const [state, send] = useMachine(tooltip.machine.withContext({ id: props.id }))

  const ref = useMount<HTMLButtonElement>(send)

  const { isVisible, triggerProps, tooltipProps } = tooltip.connect(state, send)

  useSnapshot(tooltip.store)

  return (
    <div className="App">
      <button ref={ref} {...triggerProps}>
        Over me
      </button>
      {isVisible && (
        <div {...tooltipProps} style={{ background: "red", padding: 10 }}>
          Tooltip
        </div>
      )}
    </div>
  )
}

function Page() {
  return (
    <>
      {/* <h3>{JSON.stringify(snap.id)}</h3> */}
      <div style={{ display: "flex" }}>
        <Tooltip id="tip-1" />
        <div style={{ marginLeft: "80px" }}>
          <Tooltip id="tip-2" />
        </div>
      </div>
    </>
  )
}

export default Page

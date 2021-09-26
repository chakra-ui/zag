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
        <div data-tooltip="" {...tooltipProps}>
          Tooltip
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <>
      <div style={{ display: "flex" }}>
        <Tooltip id="tip-1" />
        <div style={{ marginLeft: "20px" }}>
          <Tooltip id="tip-2" />
        </div>
      </div>
    </>
  )
}

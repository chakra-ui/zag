import { useMachine, useSetup } from "@ui-machines/react"
import { tooltip } from "@ui-machines/tooltip"

function Tooltip(props: { id?: string }) {
  const [state, send] = useMachine(tooltip.machine)
  const { isVisible, triggerProps, tooltipProps } = tooltip.connect(state, send)
  const ref = useSetup<HTMLButtonElement>({ send, id: props.id })

  return (
    <div>
      <button data-testid={`${props.id}-trigger`} ref={ref} {...triggerProps}>
        Over me
      </button>
      {isVisible && (
        <div data-testid={`${props.id}-tooltip`} data-tooltip="" {...tooltipProps}>
          Tooltip
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <Tooltip id="tip-1" />
      <Tooltip id="tip-2" />
    </div>
  )
}

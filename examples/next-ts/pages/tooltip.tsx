import { useMachine, useSetup } from "@ui-machines/react"
import * as Tooltip from "@ui-machines/tooltip"

function TooltipComponent(props: { id?: string }) {
  const [state, send] = useMachine(Tooltip.machine)
  const tooltip = Tooltip.connect(state, send)
  const ref = useSetup<HTMLButtonElement>({ send, id: props.id })

  return (
    <div>
      <button data-testid={`${props.id}-trigger`} ref={ref} {...tooltip.triggerProps}>
        Over me
      </button>
      {tooltip.isVisible && (
        <div data-testid={`${props.id}-tooltip`} data-tooltip="" {...tooltip.contentProps}>
          Tooltip
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <div style={{ display: "flex", gap: "20px" }}>
      <TooltipComponent id="tip-1" />
      <TooltipComponent id="tip-2" />
    </div>
  )
}

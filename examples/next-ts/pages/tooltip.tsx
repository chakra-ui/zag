import { useMachine, useSetup } from "@ui-machines/react"
import * as Tooltip from "@ui-machines/tooltip"

function TooltipComponent(props: { id?: string }) {
  const [state, send] = useMachine(Tooltip.machine)
  const { triggerProps, isVisible, contentProps } = Tooltip.connect(state, send)
  const ref = useSetup<HTMLButtonElement>({ send, id: props.id })

  return (
    <div>
      <button data-testid={`${props.id}-trigger`} ref={ref} {...triggerProps}>
        Over me
      </button>
      {isVisible && (
        <div data-testid={`${props.id}-tooltip`} data-tooltip="" {...contentProps}>
          Tooltip
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <div style={{ display: "flex", gap: "20px", minHeight: "200vh" }}>
      <TooltipComponent id="tip-1" />
      <TooltipComponent id="tip-2" />
    </div>
  )
}

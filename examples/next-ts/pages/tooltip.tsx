import { Global } from "@emotion/react"
import { useMachine, useSetup } from "@ui-machines/react"
import * as Tooltip from "@ui-machines/tooltip"
import { tooltipStyles } from "../../../shared/style"

function TooltipComponent(props: { id?: string }) {
  const [state, send] = useMachine(Tooltip.machine)
  const ref = useSetup<HTMLButtonElement>({ send, id: props.id })

  const { triggerProps, isVisible, contentProps } = Tooltip.connect(state, send)

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
    <>
      <Global styles={tooltipStyles} />
      <div style={{ display: "flex", gap: "20px", minHeight: "200vh" }}>
        <TooltipComponent id="tip-1" />
        <TooltipComponent id="tip-2" />
      </div>
    </>
  )
}

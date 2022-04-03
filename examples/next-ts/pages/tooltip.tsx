import { Global } from "@emotion/react"
import { useMachine, useSetup } from "@ui-machines/react"
import * as Tooltip from "@ui-machines/tooltip"
import { tooltipStyles } from "../../../shared/style"

function TooltipComponent({ id }: { id?: string }) {
  const [state, send] = useMachine(Tooltip.machine)
  const ref = useSetup<HTMLButtonElement>({ send, id })
  const api = Tooltip.connect(state, send)

  return (
    <div>
      <button data-testid={`${id}-trigger`} ref={ref} {...api.triggerProps}>
        Over me
      </button>
      {api.isOpen && (
        <div {...api.positionerProps}>
          <div data-testid={`${id}-tooltip`} className="tooltip" {...api.contentProps}>
            Tooltip
          </div>
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

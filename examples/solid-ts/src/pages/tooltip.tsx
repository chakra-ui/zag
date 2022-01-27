import { injectGlobal } from "@emotion/css"
import { normalizeProps, SolidPropTypes, useMachine, useSetup } from "@ui-machines/solid"
import * as Tooltip from "@ui-machines/tooltip"
import { createMemo } from "solid-js"
import { tooltipStyles } from "../../../../shared/style"

injectGlobal(tooltipStyles)

function TooltipComponent(props: { id?: string }) {
  const [state, send] = useMachine(Tooltip.machine)
  const ref = useSetup<HTMLButtonElement>({ send, id: props.id })

  const tooltip = createMemo(() => Tooltip.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <div>
      <button data-testid={`${props.id}-trigger`} ref={ref} {...tooltip().triggerProps}>
        Over me
      </button>
      {tooltip().isVisible && (
        <div data-testid={`${props.id}-tooltip`} data-tooltip="" {...tooltip().contentProps}>
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

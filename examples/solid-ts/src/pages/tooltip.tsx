import { injectGlobal } from "@emotion/css"
import { normalizeProps, PropTypes, useMachine, useSetup } from "@ui-machines/solid"
import * as Tooltip from "@ui-machines/tooltip"
import { createMemo } from "solid-js"
import { tooltipStyles } from "../../../../shared/style"

injectGlobal(tooltipStyles)

function TooltipComponent(props: { id?: string }) {
  const [state, send] = useMachine(Tooltip.machine)
  const ref = useSetup<HTMLButtonElement>({ send, id: props.id })

  const api = createMemo(() => Tooltip.connect<PropTypes>(state, send, normalizeProps))

  return (
    <div>
      <button data-testid={`${props.id}-trigger`} ref={ref} {...api().triggerProps}>
        Over me
      </button>
      {api().isOpen && (
        <div {...api().positionerProps}>
          <div data-testid={`${props.id}-tooltip`} {...api().contentProps}>
            Tooltip
          </div>
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <div style={{ display: "flex", gap: "20px", "min-height": "200vh" }}>
      <TooltipComponent id="tip-1" />
      <TooltipComponent id="tip-2" />
    </div>
  )
}

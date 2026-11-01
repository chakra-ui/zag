import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as tooltip from "@zag-js/tooltip"
import { createMemo } from "solid-js"
import "@styles/tooltip.css"

export default function Page() {
  const id = "tip-1"

  let anchorRect: DOMRect | null = null

  const service = useMachine(tooltip.machine, {
    id: "1",
    openDelay: 0,
    closeDelay: 0,
    positioning: {
      gutter: 4,
      placement: "top-start",
      getAnchorRect: () => anchorRect,
    },
  })

  const api = createMemo(() => tooltip.connect(service, normalizeProps))

  const triggerProps = mergeProps(() => api().getTriggerProps(), {
    style: { width: "200px", height: "40px" },
    onPointerMove(event: PointerEvent) {
      anchorRect = DOMRect.fromRect({
        x: event.clientX,
        y: event.clientY,
        width: 1,
        height: 1,
      })

      api().reposition()
    },
  })

  return (
    <main class="tooltip">
      <div class="root">
        <button data-testid={`${id}-trigger`} {...triggerProps}>
          Hover me
        </button>
        <div {...api().getPositionerProps()}>
          <div class="tooltip-content" data-testid={`${id}-tooltip`} {...api().getContentProps()}>
            Tooltip
          </div>
        </div>
      </div>
    </main>
  )
}

import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as tooltip from "@zag-js/tooltip"
import { useRef } from "react"

export default function Page() {
  const id = "tip-1"

  const anchorRect = useRef<DOMRect | null>(null)

  const [state, send] = useMachine(
    tooltip.machine({
      id: "1",
      openDelay: 0,
      closeDelay: 0,
      positioning: {
        gutter: 4,
        placement: "top-start",
        getAnchorRect: () => anchorRect.current,
      },
    }),
  )

  const api = tooltip.connect(state, send, normalizeProps)

  return (
    <main className="tooltip">
      <div className="root">
        <button
          data-testid={`${id}-trigger`}
          {...mergeProps(api.getTriggerProps(), {
            style: { width: "200px", height: "40px" },
            onPointerMove(event) {
              anchorRect.current = DOMRect.fromRect({
                x: event.clientX,
                y: event.clientY,
                width: 1,
                height: 1,
              })

              api.reposition()
            },
          })}
        >
          Hover me
        </button>
        <div {...api.getPositionerProps()}>
          <div className="tooltip-content" data-testid={`${id}-tooltip`} {...api.getContentProps()}>
            Tooltip
          </div>
        </div>
      </div>
    </main>
  )
}

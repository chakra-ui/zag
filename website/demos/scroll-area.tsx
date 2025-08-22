import * as scrollArea from "@zag-js/scroll-area"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

export function ScrollArea() {
  const service = useMachine(scrollArea.machine, {
    id: useId(),
  })

  const api = scrollArea.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <div {...api.getViewportProps()}>
        <div {...api.getContentProps()}>
          {Array.from({ length: 50 }).map((_, index) => (
            <div key={index} className="item">
              Item {index + 1}
            </div>
          ))}
        </div>
      </div>
      <div {...api.getScrollbarProps()}>
        <div {...api.getThumbProps()} />
      </div>
    </div>
  )
}

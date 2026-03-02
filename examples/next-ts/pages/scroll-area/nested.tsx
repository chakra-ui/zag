import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as scrollArea from "@zag-js/scroll-area"
import { useId } from "react"

const ScrollArea = (props: React.ComponentProps<"div">) => {
  const { children, ...rest } = props
  const service = useMachine(scrollArea.machine, { id: useId() })
  const api = scrollArea.connect(service, normalizeProps)

  return (
    <div {...mergeProps(api.getRootProps(), rest)}>
      <div {...api.getViewportProps()}>
        <div {...api.getContentProps()}>{children}</div>
      </div>
      {api.hasOverflowY && (
        <div {...api.getScrollbarProps()}>
          <div {...api.getThumbProps()} />
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <main className="scroll-area">
      <ScrollArea style={{ height: 500, width: 800 }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <ScrollArea key={index} style={{ maxHeight: 200 }}>
            {Array.from({ length: 100 }).map((_, index) => (
              <div key={index}>{index}</div>
            ))}
          </ScrollArea>
        ))}
      </ScrollArea>
    </main>
  )
}

import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as scrollView from "@zag-js/scroll-view"
import { useId } from "react"

const ScrollView = (props: React.ComponentProps<"div">) => {
  const { children, ...rest } = props
  const service = useMachine(scrollView.machine, { id: useId() })
  const api = scrollView.connect(service, normalizeProps)

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
    <main className="scroll-view">
      <ScrollView style={{ height: 500, width: 800 }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <ScrollView key={index} style={{ maxHeight: 200 }}>
            {Array.from({ length: 100 }).map((_, index) => (
              <div key={index}>{index}</div>
            ))}
          </ScrollView>
        ))}
      </ScrollView>
    </main>
  )
}

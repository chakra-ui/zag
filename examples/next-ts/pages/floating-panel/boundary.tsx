import * as floating from "@zag-js/floating-panel"
import { normalizeProps, useMachine } from "@zag-js/react"
import { ArrowDownLeft, Maximize2, Minus, XIcon } from "lucide-react"
import { useId, useRef, useState } from "react"

export default function Page() {
  const boundaryRef = useRef<HTMLDivElement>(null)
  const [strategy, setStrategy] = useState<"fixed" | "absolute">("fixed")

  const service = useMachine(floating.machine, {
    id: useId(),
    getBoundaryEl: () => boundaryRef.current,
    strategy,
  })

  const api = floating.connect(service, normalizeProps)

  return (
    <main className="floating-panel">
      <div className="scroll-area" data-testid="scroller">
        <p>Scroll this area. The panel stays inside the dashed boundary.</p>
        <button onClick={() => setStrategy((s) => (s === "fixed" ? "absolute" : "fixed"))}>Toggle strategy</button>
        <p>strategy: {strategy}</p>
        <div className="scroll-spacer" />
        <div className="boundary" ref={boundaryRef} data-testid="boundary">
          <button {...api.getTriggerProps()}>Toggle Panel</button>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <div {...api.getDragTriggerProps()}>
                <div {...api.getHeaderProps()}>
                  <p {...api.getTitleProps()}>Floating Panel</p>
                  <div {...api.getControlProps()}>
                    <button {...api.getStageTriggerProps({ stage: "minimized" })}>
                      <Minus />
                    </button>
                    <button {...api.getStageTriggerProps({ stage: "maximized" })}>
                      <Maximize2 />
                    </button>
                    <button {...api.getStageTriggerProps({ stage: "default" })}>
                      <ArrowDownLeft />
                    </button>
                    <button {...api.getCloseTriggerProps()}>
                      <XIcon />
                    </button>
                  </div>
                </div>
              </div>
              <div {...api.getBodyProps()}>
                <p>Some content</p>
              </div>
              {floating.resizeTriggerAxes.map((axis) => (
                <div key={axis} {...api.getResizeTriggerProps({ axis })} />
              ))}
            </div>
          </div>
        </div>
        <div className="scroll-spacer" />
      </div>
    </main>
  )
}

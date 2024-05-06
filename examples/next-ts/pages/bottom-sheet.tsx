import * as bottomSheet from "@zag-js/bottom-sheet"
import { normalizeProps, useMachine } from "@zag-js/react"
import { bottomSheetControls } from "@zag-js/shared"
import { TicketPlusIcon } from "lucide-react"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(bottomSheetControls)

  const [state, send] = useMachine(
    bottomSheet.machine({
      id: useId(),
    }),
    {
      context: controls.context,
    },
  )

  const api = bottomSheet.connect(state, send, normalizeProps)

  return (
    <>
      <main className="bottom-sheet">
        <button {...api.triggerProps}>Open</button>
        <div {...api.backdropProps} />

        <div {...api.grabberProps}>
          <div {...api.contentProps}>
            <div>
              <div className="x">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="x-trigger">
                    <button>
                      <TicketPlusIcon />
                    </button>
                    <span className="x-trigger-text">Whats new</span>
                  </div>
                ))}
              </div>

              <div className="y">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="y-trigger">
                    <button>
                      <span>Whats new</span>
                      <TicketPlusIcon />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* <button {...api.closeTriggerProps}>
            <XIcon />
          </button> */}
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui} viz>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}

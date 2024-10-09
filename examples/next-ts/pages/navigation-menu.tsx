import * as navigationMenu from "@zag-js/navigation-menu"
import { normalizeProps, useMachine } from "@zag-js/react"
import { navigationMenuControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(navigationMenuControls)

  const [state, send] = useMachine(navigationMenu.machine({ id: useId() }), {
    context: controls.context,
  })

  const api = navigationMenu.connect(state, send, normalizeProps)

  return (
    <>
      <main className="navigation-menu">
        <div {...api.getRootProps()}>
          <div {...api.getListProps()}>
            <div {...api.getItemProps({ value: "home" })}>
              <button {...api.getTriggerProps({ value: "home" })}>
                Home
                <span {...api.getIndicatorProps({ value: "home" })} />
              </button>
              <div {...api.getContentProps({ value: "home" })}>
                <a href="#" {...api.getLinkProps()}>
                  Home
                </a>
                <a href="#" {...api.getLinkProps()}>
                  About
                </a>
                <a href="#" {...api.getLinkProps()}>
                  Contact
                </a>
              </div>
            </div>
            <div {...api.getItemProps({ value: "about" })}>
              <button {...api.getTriggerProps({ value: "about" })}>
                About
                <span {...api.getIndicatorProps({ value: "about" })} />
              </button>
              <div {...api.getContentProps({ value: "about" })}>
                <a href="#" {...api.getLinkProps()}>
                  Home
                </a>
                <a href="#" {...api.getLinkProps()}>
                  About
                </a>
                <a href="#" {...api.getLinkProps()}>
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}

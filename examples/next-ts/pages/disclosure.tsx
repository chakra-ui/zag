import * as disclosure from "@zag-js/disclosure"
import { useMachine, normalizeProps } from "@zag-js/react"
import { disclosureControls, disclosureData } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(disclosureControls)

  const [state, send] = useMachine(disclosure.machine({ id: useId() }), {
    context: controls.context,
  })

  const api = disclosure.connect(state, send, normalizeProps)

  return (
    <>
      <main className="disclosure">
        <a href="#" {...api.buttonProps}>
          {disclosureData.label}
        </a>
        <div {...api.disclosureProps}>
          <ul>
            {disclosureData.content.map(({ href, label }, index) => (
              <li key={index}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}

import * as disclosure from "@zag-js/disclosure"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { disclosureControls, disclosureData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(disclosureControls)

  const [state, send] = useMachine(disclosure.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => disclosure.connect(state, send, normalizeProps))

  return (
    <>
      <main class="disclosure">
        <a href="#" {...api().buttonProps}>
          {disclosureData.label}
        </a>
        <div {...api().disclosureProps}>
          <ul>
            {disclosureData.content.map(({ href, label }) => (
              <li>
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

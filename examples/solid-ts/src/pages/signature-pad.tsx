import * as signaturePad from "@zag-js/signature-pad"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { signaturePadControls, signaturePadData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(signaturePadControls)

  const [state, send] = useMachine(signaturePad.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => signaturePad.connect(state, send, normalizeProps))

  return (
    <>
      <main class="signature-pad"> 
        <div {...api().rootProps}> 
            
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}

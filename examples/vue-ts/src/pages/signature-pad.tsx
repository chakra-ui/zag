import * as signaturePad from "@zag-js/signature-pad"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { signaturePadControls, signaturePadData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "signature-pad",
  setup() {
    const controls = useControls(signaturePadControls)

    const [state, send] = useMachine(signaturePad.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => signaturePad.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="signature-pad">
            <div {...api.rootProps}>
            
            </div>
          </main>

          <Toolbar controls={controls.ui}>
            <StateVisualizer state={state} />
          </Toolbar>
        </>
      )
    }
  },
})

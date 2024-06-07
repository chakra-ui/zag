import * as qrCode from "@zag-js/qr-code"
import { qrCodeControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "qr-code",
  setup() {
    const controls = useControls(qrCodeControls)

    const [state, send] = useMachine(qrCode.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => qrCode.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="qr-code">
            <div {...api.getRootProps()}>
              <svg {...api.getFrameProps()}>
                <path {...api.getPatternProps()} />
              </svg>
              <div {...api.getOverlayProps()}>
                <img src="https://avatars.githubusercontent.com/u/54212428?s=88&v=4" alt="" />
              </div>
            </div>
          </main>

          <Toolbar controls={controls.ui}>
            <StateVisualizer state={state} omit={["encoded"]} />
          </Toolbar>
        </>
      )
    }
  },
})

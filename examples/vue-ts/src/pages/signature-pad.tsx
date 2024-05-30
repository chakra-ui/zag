import * as signaturePad from "@zag-js/signature-pad"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment, ref } from "vue"
import { signaturePadControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"
import { RotateCcw } from "lucide-vue-next"

export default defineComponent({
  name: "signature-pad",
  setup() {
    const controls = useControls(signaturePadControls)
    const urlRef = ref("")
    const setUrl = (v: string) => {
      urlRef.value = v
    }

    const [state, send] = useMachine(
      signaturePad.machine({
        id: "1",
        onDrawEnd(details) {
          details.getDataUrl("image/png").then(setUrl)
        },
      }),
      {
        context: controls.context,
      },
    )

    const apiRef = computed(() => signaturePad.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="signature-pad">
            <div {...api.getRootProps()}>
              <label {...api.getLabelProps()}>Signature Pad</label>

              <div {...api.getControlProps()}>
                <svg {...api.getSegmentProps()}>
                  {api.paths.map((path, i) => (
                    <path key={i} {...api.getSegmentPathProps({ path })} />
                  ))}
                  {api.currentPath && <path {...api.getSegmentPathProps({ path: api.currentPath })} />}
                </svg>

                <div {...api.getGuideProps()} />
              </div>

              <button {...api.getClearTriggerProps()}>
                <RotateCcw />
              </button>
            </div>

            <button
              onClick={() => {
                api.getDataUrl("image/png").then(setUrl)
              }}
            >
              Show Image
            </button>
            {urlRef.value && <img data-part="preview" alt="signature" src={urlRef.value} />}
          </main>

          <Toolbar controls={controls.ui}>
            <StateVisualizer state={state} omit={["points"]} />
          </Toolbar>
        </>
      )
    }
  },
})

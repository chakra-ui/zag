import * as fileUpload from "@zag-js/file-upload"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { fileUploadControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "fileUpload",
  setup() {
    const controls = useControls(fileUploadControls)

    const [state, send] = useMachine(fileUpload.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => fileUpload.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="fileUpload">
            <div {...api.rootProps}></div>
          </main>

          <Toolbar controls={controls.ui}>
            <StateVisualizer state={state} />
          </Toolbar>
        </>
      )
    }
  },
})

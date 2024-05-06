import * as bottomSheet from "@zag-js/bottom-sheet"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { bottomSheetControls, bottomSheetData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "bottom-sheet",
  setup() {
    const controls = useControls(bottomSheetControls)

    const [state, send] = useMachine(bottomSheet.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => bottomSheet.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="bottom-sheet">
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

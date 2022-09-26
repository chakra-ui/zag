import * as pagination from "@zag-js/pagination"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { paginationControls, paginationStyle } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "pagination",
  setup() {
    const controls = useControls(paginationControls)

    const [state, send] = useMachine(pagination.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => pagination.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="pagination">
            <div {...api.rootProps}></div>
          </main>

          <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
        </>
      )
    }
  },
})

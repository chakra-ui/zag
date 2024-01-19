import * as tree from "@zag-js/tree-view"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
// import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "tree-view",
  setup() {
    // const controls = useControls(treeViewControls)

    const [state, send] = useMachine(tree.machine({ id: "1" }), {
      // context: controls.context,
    })

    const apiRef = computed(() => tree.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="tree-view">
            <div {...api.rootProps}></div>
          </main>

          <Toolbar>
            <StateVisualizer state={state} />
          </Toolbar>
        </>
      )
    }
  },
})

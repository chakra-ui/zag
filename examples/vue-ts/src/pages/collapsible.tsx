import * as collapsible from "@zag-js/collapsible"
import { collapsibleControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "collapsible",
  setup() {
    const controls = useControls(collapsibleControls)

    const [state, send] = useMachine(collapsible.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => collapsible.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="collapsible">
            <div {...api.rootProps}>
              <button {...api.triggerProps}>Collapsible Trigger</button>
              <div {...api.contentProps}>
                <p>
                  Lorem dfd dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                  dolore magna sfsd. Ut enim ad minimdfd v eniam, quis nostrud exercitation ullamco laboris nisi ut
                  aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
                  officia deserunt mollit anim id est laborum. <a href="#">Some Link</a>
                </p>
              </div>
            </div>

            <div>
              <div>Toggle Controls</div>
              <button onClick={() => api.setOpen(true)}>Open</button>
              <button onClick={() => api.setOpen(false)}>Close</button>
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

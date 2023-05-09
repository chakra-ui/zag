import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, Teleport } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineComponent({
  name: "Menu",
  setup() {
    const [state, send] = useMachine(
      menu.machine({
        id: "context-menu",
        onSelect: console.log,
      }),
    )

    const apiRef = computed(() => menu.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value
      return (
        <>
          <main class="context-menu">
            <div {...api.contextTriggerProps}>Right click here</div>
            <Teleport to="body">
              <div {...api.positionerProps}>
                <ul {...api.contentProps}>
                  <li {...api.getItemProps({ id: "edit" })}>Edit</li>
                  <li {...api.getItemProps({ id: "duplicate" })}>Duplicate</li>
                  <li {...api.getItemProps({ id: "delete" })}>Delete</li>
                  <li {...api.getItemProps({ id: "export" })}>Export...</li>
                </ul>
              </div>
            </Teleport>
          </main>

          <Toolbar>
            <StateVisualizer state={state} />
          </Toolbar>
        </>
      )
    }
  },
})

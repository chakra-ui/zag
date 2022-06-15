import { injectGlobal } from "@emotion/css"
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine, useSetup, PropTypes } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment, Teleport } from "vue"
import { menuStyle } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useId } from "../hooks/use-id"

injectGlobal(menuStyle)

export default defineComponent({
  name: "Menu",
  setup() {
    const [state, send] = useMachine(
      menu.machine({
        onSelect: console.log,
      }),
    )

    const ref = useSetup({ send, id: useId() })

    const apiRef = computed(() => menu.connect<PropTypes>(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value
      return (
        <>
          <main>
            <div {...api.contextTriggerProps}>
              <div style={{ border: "solid 1px red" }}>Open context menu</div>
            </div>
            <Teleport to="body">
              <div {...api.positionerProps}>
                <ul ref={ref} {...api.contentProps}>
                  <li {...api.getItemProps({ id: "edit" })}>Edit</li>
                  <li {...api.getItemProps({ id: "duplicate" })}>Duplicate</li>
                  <li {...api.getItemProps({ id: "delete" })}>Delete</li>
                  <li {...api.getItemProps({ id: "export" })}>Export...</li>
                </ul>
              </div>
            </Teleport>
          </main>

          <Toolbar controls={null} visualizer={<StateVisualizer state={state} />} />
        </>
      )
    }
  },
})

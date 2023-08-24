import * as menu from "@zag-js/menu"
import { menuControls, menuOptionData as data } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { useControls } from "../hooks/use-controls"
import { computed, defineComponent, Teleport } from "vue"
import { StateVisualizer } from "../components/state-visualizer"

import { Toolbar } from "../components/toolbar"

export default defineComponent({
  name: "Menu",
  setup() {
    const controls = useControls(menuControls)
    const [state, send] = useMachine(
      menu.machine({
        id: "1",
        value: { order: "", type: [] },
        onValueChange: console.log,
      }),
    )

    const apiRef = computed(() => menu.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value
      return (
        <>
          <main>
            <div>
              <button data-testid="trigger" {...api.triggerProps}>
                Actions <span aria-hidden>▾</span>
              </button>
              <Teleport to="body">
                <div {...api.positionerProps}>
                  <div {...api.contentProps}>
                    {data.order.map((item) => {
                      const opts = { type: "radio", name: "order", value: item.id } as const
                      return (
                        <div key={item.id} {...api.getOptionItemProps(opts)}>
                          {api.isOptionChecked(opts) ? "✅" : null} {item.label}
                        </div>
                      )
                    })}
                    <hr />
                    {data.type.map((item) => {
                      const opts = { type: "checkbox", name: "type", value: item.id } as const
                      return (
                        <div key={item.id} {...api.getOptionItemProps(opts)}>
                          {api.isOptionChecked(opts) ? "✅" : null} {item.label}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Teleport>
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

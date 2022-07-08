import { injectGlobal } from "@emotion/css"
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment, Teleport } from "vue"
import { menuOptionData as data, menuStyle } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"

import { Toolbar } from "../components/toolbar"

injectGlobal(menuStyle)

export default defineComponent({
  name: "Menu",
  setup() {
    const [state, send] = useMachine(
      menu.machine({
        id: "menu-options",
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
              <button {...api.triggerProps}>
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

          <Toolbar controls={null} visualizer={<StateVisualizer state={state} />} />
        </>
      )
    }
  },
})

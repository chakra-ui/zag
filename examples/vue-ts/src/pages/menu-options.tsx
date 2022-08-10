import * as menu from "@zag-js/menu"
import { menuOptionData as data } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, Teleport } from "vue"
import { StateVisualizer } from "../components/state-visualizer"

import { Toolbar } from "../components/toolbar"

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
                  <div class="menu-content" {...api.contentProps}>
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

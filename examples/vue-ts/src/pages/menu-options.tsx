import { injectGlobal } from "@emotion/css"
import * as menu from "@ui-machines/menu"
import { normalizeProps, useMachine, useSetup, PropTypes } from "@ui-machines/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { menuStyle } from "../../../../shared/style"
import { menuOptionData as data } from "../../../../shared/data"
import { StateVisualizer } from "../components/state-visualizer"

injectGlobal(menuStyle)

export default defineComponent({
  name: "Menu",
  setup() {
    const [state, send] = useMachine(
      menu.machine.withContext({
        values: { order: "", type: [] },
        onValuesChange: console.log,
      }),
    )

    const ref = useSetup({ send, id: "1" })

    const apiRef = computed(() => menu.connect<PropTypes>(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value
      return (
        <>
          <div ref={ref}>
            <button {...api.triggerProps}>
              Actions <span aria-hidden>▾</span>
            </button>

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
          </div>

          <StateVisualizer state={state} />
        </>
      )
    }
  },
})

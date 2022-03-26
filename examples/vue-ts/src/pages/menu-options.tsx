import { injectGlobal } from "@emotion/css"
import * as Menu from "@ui-machines/menu"
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
      Menu.machine.withContext({
        values: { order: "", type: [] },
        onValuesChange: console.log,
      }),
    )

    const ref = useSetup({ send, id: "1" })

    const apiRef = computed(() => Menu.connect<PropTypes>(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value
      return (
        <>
          <div>
            <button class="menu__trigger" ref={ref} {...api.triggerProps}>
              Actions <span aria-hidden>▾</span>
            </button>
            <div {...api.positionerProps}>
              <div class="menu__content" {...api.contentProps}>
                {data.order.map((item) => {
                  const opts = { type: "radio", name: "order", value: item.id } as const
                  return (
                    <div key={item.id} class="menu__item" {...api.getOptionItemProps(opts)}>
                      {api.isOptionChecked(opts) ? "✅" : null} {item.label}
                    </div>
                  )
                })}
                <hr />
                {data.type.map((item) => {
                  const opts = { type: "checkbox", name: "type", value: item.id } as const
                  return (
                    <div key={item.id} class="menu__item" {...api.getOptionItemProps(opts)}>
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

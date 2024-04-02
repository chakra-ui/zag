import * as menu from "@zag-js/menu"
import { menuControls, menuOptionData as data } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { useControls } from "../hooks/use-controls"
import { computed, defineComponent, ref, Teleport } from "vue"
import { StateVisualizer } from "../components/state-visualizer"

import { Toolbar } from "../components/toolbar"

export default defineComponent({
  name: "Menu",
  setup() {
    const controls = useControls(menuControls)

    const orderRef = ref("")
    const typeRef = ref<string[]>([])

    const [state, send] = useMachine(menu.machine({ id: "1" }))

    const apiRef = computed(() => menu.connect(state.value, send, normalizeProps))

    const radios = computed(() =>
      data.order.map((item) => ({
        type: "radio" as const,
        value: item.value,
        label: item.label,
        checked: orderRef.value === item.value,
        onCheckedChange: (checked: boolean) => (orderRef.value = checked ? item.value : ""),
      })),
    )

    const checkboxes = computed(() =>
      data.type.map((item) => ({
        type: "checkbox" as const,
        value: item.value,
        label: item.label,
        checked: typeRef.value.includes(item.value),
        onCheckedChange: (checked: boolean) =>
          (typeRef.value = checked ? [...typeRef.value, item.value] : typeRef.value.filter((x) => x !== item.value)),
      })),
    )

    return () => {
      const api = apiRef.value
      return (
        <>
          <main>
            <div>
              <button data-testid="trigger" {...api.triggerProps}>
                Actions <span {...api.indicatorProps}>▾</span>
              </button>
              <Teleport to="body">
                <div {...api.positionerProps}>
                  <div {...api.contentProps}>
                    {radios.value.map((item) => (
                      <div key={item.value} {...api.getOptionItemProps(item)}>
                        <span {...api.getItemIndicatorProps(item)}>✅</span>
                        <span {...api.getItemTextProps(item)}>{item.label}</span>
                      </div>
                    ))}
                    <hr {...api.separatorProps} />
                    {checkboxes.value.map((item) => (
                      <div key={item.value} {...api.getOptionItemProps(item)}>
                        <span {...api.getItemIndicatorProps(item)}>✅</span>
                        <span {...api.getItemTextProps(item)}>{item.label}</span>
                      </div>
                    ))}
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

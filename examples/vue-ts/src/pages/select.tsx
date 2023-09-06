import * as select from "@zag-js/select"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, Teleport } from "vue"
import { selectControls, selectData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"
import serialize from "form-serialize"

export default defineComponent({
  name: "select",
  setup() {
    const controls = useControls(selectControls)

    const [state, send] = useMachine(
      select.machine({
        id: "1",
        collection: select.collection({ items: selectData }),
      }),
      {
        context: controls.context,
      },
    )

    const apiRef = computed(() => select.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="select">
            <div {...api.rootProps}>
              {/* control */}
              <div {...api.controlProps}>
                <label {...api.labelProps}>Label</label>
                <button {...api.triggerProps}>
                  {api.valueAsString || "Select option"}
                  <span>▼</span>
                </button>
              </div>

              <form
                onInput={(e) => {
                  const form = e.currentTarget as HTMLFormElement
                  const formData = serialize(form, { hash: true })
                  console.log(formData)
                }}
              >
                {/* Hidden select */}
                <select {...api.hiddenSelectProps}>
                  {selectData.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </form>

              {/* UI select */}
              <Teleport to="body">
                <div {...api.positionerProps}>
                  <ul {...api.contentProps}>
                    {selectData.map((item) => (
                      <li key={item.value} {...api.getItemProps({ item })}>
                        <span class="item-label">{item.label}</span>
                        <span {...api.getItemIndicatorProps({ item })}>✓</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Teleport>
            </div>
          </main>

          <Toolbar controls={controls.ui}>
            <StateVisualizer state={state} omit={["collection"]} />
          </Toolbar>
        </>
      )
    }
  },
})

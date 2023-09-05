import * as combobox from "@zag-js/combobox"
import { comboboxControls, comboboxData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, ref } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "Combobox",
  setup() {
    const controls = useControls(comboboxControls)
    const options = ref(comboboxData)
    const collectionRef = computed(() =>
      combobox.collection({
        items: options.value,
        itemToValue: (item) => item.code,
        itemToString: (item) => item.label,
      }),
    )

    const [state, send] = useMachine(
      combobox.machine({
        collection: collectionRef.value,
        id: "1",
        onOpen() {
          options.value = comboboxData
        },
        onInputChange({ value }) {
          const filtered = comboboxData.filter((item) => item.label.toLowerCase().includes(value.toLowerCase()))
          options.value = filtered.length > 0 ? filtered : comboboxData
        },
      }),
      {
        context: computed(() => ({
          ...controls.context.value,
          collection: collectionRef.value,
        })),
      },
    )

    const apiRef = computed(() => combobox.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="combobox">
            <div>
              <button onClick={() => api.setValue(["TG"])}>Set to Togo</button>
              <button data-testid="clear-value-button" onClick={() => api.clearValue()}>
                Clear Value
              </button>

              <br />

              <div {...api.rootProps}>
                <label {...api.labelProps}>Select country</label>

                <div {...api.controlProps}>
                  <input data-testid="input" {...api.inputProps} />
                  <button data-testid="trigger" {...api.triggerProps}>
                    ▼
                  </button>
                </div>
              </div>

              <div {...api.positionerProps}>
                {options.value.length > 0 && (
                  <ul data-testid="combobox-content" {...api.contentProps}>
                    {options.value.map((item) => (
                      <li key={item.code} {...api.getItemProps({ item })}>
                        {item.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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

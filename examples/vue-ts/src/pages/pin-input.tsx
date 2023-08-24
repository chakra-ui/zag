import * as pinInput from "@zag-js/pin-input"
import { pinInputControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import serialize from "form-serialize"
import { computed, defineComponent } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "PinInput",
  setup() {
    const controls = useControls(pinInputControls)

    const [state, send] = useMachine(
      pinInput.machine({
        id: "1",
        name: "test",
      }),
      {
        context: controls.context,
      },
    )

    const apiRef = computed(() => pinInput.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value
      return (
        <>
          <main class="pin-input">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = serialize(e.currentTarget as HTMLFormElement, { hash: true })
                console.log(formData)
              }}
            >
              <div {...api.rootProps}>
                <label {...api.labelProps}>Enter code:</label>
                <div {...api.controlProps}>
                  <input data-testid="input-1" {...api.getInputProps({ index: 0 })} />
                  <input data-testid="input-2" {...api.getInputProps({ index: 1 })} />
                  <input data-testid="input-3" {...api.getInputProps({ index: 2 })} />
                </div>
                <input {...api.hiddenInputProps} />
              </div>
              <button data-testid="clear-button" onClick={api.clearValue}>
                Clear
              </button>
            </form>
          </main>

          <Toolbar controls={controls.ui}>
            <StateVisualizer state={state} />
          </Toolbar>
        </>
      )
    }
  },
})

import { injectGlobal } from "@emotion/css"
import { defineComponent } from "@vue/runtime-core"
import * as pinInput from "@zag-js/pin-input"
import { pinInputControls, pinInputStyle } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import serialize from "form-serialize"
import { computed, h, Fragment } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

injectGlobal(pinInputStyle)

export default defineComponent({
  name: "PinInput",
  setup() {
    const controls = useControls(pinInputControls)

    const [state, send] = useMachine(
      pinInput.machine({
        id: "pinInput",
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
          <main>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = serialize(e.currentTarget as HTMLFormElement, { hash: true })
                console.log(formData)
              }}
            >
              <div {...api.rootProps}>
                <input data-testid="input-1" {...api.getInputProps({ index: 0 })} />
                <input data-testid="input-2" {...api.getInputProps({ index: 1 })} />
                <input data-testid="input-3" {...api.getInputProps({ index: 2 })} />
              </div>
              <input {...api.hiddenInputProps} />
              <button data-testid="clear-button" onClick={api.clearValue}>
                Clear
              </button>
            </form>
          </main>

          <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
        </>
      )
    }
  },
})

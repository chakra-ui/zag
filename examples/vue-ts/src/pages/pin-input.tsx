import { injectGlobal } from "@emotion/css"
import * as pinInput from "@zag-js/pin-input"
import { normalizeProps, useMachine, useSetup, PropTypes } from "@zag-js/vue"
import { defineComponent } from "@vue/runtime-core"
import { useControls } from "../hooks/use-controls"
import { computed, h, Fragment } from "vue"
import { pinInputStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { pinInputControls } from "../../../../shared/controls"
import { useId } from "../hooks/use-id"
import { Toolbar } from "../components/toolbar"

injectGlobal(pinInputStyle)

export default defineComponent({
  name: "PinInput",
  setup() {
    const controls = useControls(pinInputControls)

    const [state, send] = useMachine(pinInput.machine, {
      context: controls.context,
    })

    const ref = useSetup({ send, id: useId() })

    const apiRef = computed(() => pinInput.connect<PropTypes>(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value
      return (
        <>
          <main>
            <div>
              <div ref={ref} {...api.rootProps}>
                <input data-testid="input-1" {...api.getInputProps({ index: 0 })} />
                <input data-testid="input-2" {...api.getInputProps({ index: 1 })} />
                <input data-testid="input-3" {...api.getInputProps({ index: 2 })} />
              </div>
              <button data-testid="clear-button" onClick={api.clearValue}>
                Clear
              </button>
            </div>
          </main>

          <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
        </>
      )
    }
  },
})

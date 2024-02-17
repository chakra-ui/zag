import * as clipboard from "@zag-js/clipboard"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { ClipboardCheck, ClipboardCopyIcon } from "lucide-vue-next"
import { clipboardControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "clipboard",
  setup() {
    const controls = useControls(clipboardControls)

    const [state, send] = useMachine(
      clipboard.machine({
        id: "1",
        value: "https://github/com/chakra-ui/zag",
      }),
      {
        context: controls.context,
      },
    )

    const apiRef = computed(() => clipboard.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="clipboard">
            <div {...api.rootProps}>
              <label {...api.labelProps}>Copy this link</label>
              <div {...api.controlProps}>
                <input {...api.inputProps} style={{ width: "100%" }} />
                <button {...api.triggerProps}>{api.isCopied ? <ClipboardCheck /> : <ClipboardCopyIcon />}</button>
              </div>
              <div {...api.getIndicatorProps({ copied: true })}>Copied!</div>
              <div {...api.getIndicatorProps({ copied: false })}>Copy</div>
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

import { toastControls } from "@zag-js/shared"
import * as toast from "@zag-js/toast"
import { normalizeProps, useActor, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import type { PropType } from "vue"
import { computed, defineComponent, ref } from "vue"
import { LoaderBar } from "../components/loader"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

const ToastItem = defineComponent({
  props: {
    actor: {
      type: Object as PropType<toast.Service>,
      required: true,
    },
  },
  setup(props) {
    const [state, send] = useActor(props.actor)
    const apiRef = computed(() => toast.connect(state.value, send, normalizeProps))
    return () => {
      const api = apiRef.value

      return (
        <pre {...api.rootProps}>
          <span {...api.ghostBeforeProps} />
          <div data-scope="toast" data-part="progressbar" />
          <p {...api.titleProps}>
            {api.type === "loading" && <LoaderBar />}
            {api.title}
          </p>
          <span {...api.ghostAfterProps} />
          <button {...api.closeTriggerProps}>
            <XIcon />
          </button>
        </pre>
      )
    }
  },
})

export default defineComponent({
  name: "Toast",
  setup() {
    const controls = useControls(toastControls)

    const [state, send] = useMachine(
      toast.group.machine({
        id: "1",
        placement: "bottom-end",
        removeDelay: 250,
        overlap: true,
      }),
      {
        context: controls.context,
      },
    )

    const apiRef = computed(() => toast.group.connect(state.value, send, normalizeProps))
    const id = ref<string>()

    return () => {
      const api = apiRef.value
      return (
        <>
          <main>
            <div style={{ display: "flex", gap: "16px" }}>
              <button
                onClick={() => {
                  api.create({
                    title: "Fetching data...",
                    type: "loading",
                  })
                }}
              >
                Notify (Loading)
              </button>
              <button
                onClick={() => {
                  id.value = api.create({
                    title: "Ooops! Something was wrong",
                    type: "error",
                  })
                }}
              >
                Notify (Info)
              </button>
              <button
                onClick={() => {
                  if (!id.value) return
                  api.update(id.value, {
                    title: "Testing",
                    type: "loading",
                  })
                }}
              >
                Update Latest
              </button>
              <button onClick={() => api.dismiss()}>Close all</button>
              <button onClick={() => api.pause()}>Pause all</button>
              <button onClick={() => api.resume()}>Resume all</button>
            </div>
            {api.getPlacements().map((placement) => (
              <div key={placement} {...api.getGroupProps({ placement })}>
                {api.getToastsByPlacement(placement).map((toast) => (
                  <ToastItem key={toast.id} actor={toast} />
                ))}
              </div>
            ))}
          </main>

          <Toolbar controls={controls.ui}>
            <StateVisualizer state={state} />
          </Toolbar>
        </>
      )
    }
  },
})

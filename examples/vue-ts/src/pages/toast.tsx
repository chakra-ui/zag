import { injectGlobal } from "@emotion/css"
import * as toast from "@zag-js/toast"
import { normalizeProps, useActor, useMachine, useSetup, PropTypes } from "@zag-js/vue"
import { HollowDotsSpinner } from "epic-spinners"
import { computed, defineComponent, h, PropType, ref, Fragment } from "vue"
import { toastControls } from "../../../../shared/controls"
import { toastStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

injectGlobal(toastStyle)

const ToastItem = defineComponent({
  props: {
    actor: {
      type: Object as PropType<toast.Service>,
      required: true,
    },
  },
  setup(props) {
    const [state, send] = useActor(props.actor)
    const apiRef = computed(() => toast.connect<PropTypes>(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value
      return (
        <pre {...api.rootProps}>
          <div {...api.progressbarProps} />
          <p {...api.titleProps}>{api.title}</p>
          {/* @ts-ignore */}
          <p>{api.type === "loading" ? <HollowDotsSpinner /> : null}</p>
          <button onClick={api.dismiss}>Close</button>
        </pre>
      )
    }
  },
})

export default defineComponent({
  name: "Toast",
  setup() {
    const controls = useControls(toastControls)

    const [state, send] = useMachine(toast.group.machine, {
      context: controls.context,
    })

    const toastRef = useSetup({ send, id: "1" })
    const apiRef = computed(() => toast.group.connect<PropTypes>(state.value, send, normalizeProps))

    const id = ref<string>()

    return () => {
      const api = apiRef.value
      return (
        <>
          <controls.ui />

          <div ref={toastRef} style={{ display: "flex", gap: "16px" }}>
            <button
              onClick={() => {
                id.value = api.create({
                  title: "Welcome",
                  description: "Welcome",
                  type: "info",
                })
              }}
            >
              Notify (Info)
            </button>
            <button
              onClick={() => {
                api.create({
                  title: "Ooops! Something was wrong",
                  type: "error",
                })
              }}
            >
              Notify (Error)
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
              Update Child (info)
            </button>
            <button onClick={() => api.dismiss()}>Close all</button>
            <button onClick={() => api.pause()}>Pause all</button>
            <button onClick={() => api.resume()}>Resume all</button>
          </div>

          <div {...api.getGroupProps({ placement: "bottom" })}>
            {api.toasts.map((actor) => (
              <ToastItem key={actor.id} actor={actor} />
            ))}
          </div>

          <StateVisualizer state={state} />
        </>
      )
    }
  },
})

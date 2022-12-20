import { toastControls } from "@zag-js/shared"
import * as toast from "@zag-js/toast"
import { normalizeProps, useActor, useMachine } from "@zag-js/vue"
import { HollowDotsSpinner } from "epic-spinners"
import type { PropType } from "vue"
import { computed, defineComponent, ref } from "vue"
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
    const progressbarProps = computed(() => ({
      "data-scope": "toast",
      "data-part": "progressbar",
      "data-type": state.value.context.type,
      style: {
        opacity: apiRef.value.isVisible ? 1 : 0,
        transformOrigin: apiRef.value.isRtl ? "right" : "left",
        animationName: apiRef.value.type === "loading" ? "none" : undefined,
        animationPlayState: apiRef.value.isPaused ? "paused" : "running",
        animationDuration: `${state.value.context.duration}ms`,
      },
    }))

    return () => {
      const api = apiRef.value

      return (
        <pre {...api.rootProps}>
          <div {...progressbarProps.value} />
          <p {...api.titleProps}>{api.title}</p>
          <p>{api.type === "loading" ? <HollowDotsSpinner /> : null}</p>
          <button {...api.closeTriggerProps}>Close</button>
        </pre>
      )
    }
  },
})

export default defineComponent({
  name: "Toast",
  setup() {
    const controls = useControls(toastControls)

    const [state, send] = useMachine(toast.group.machine({ id: "toast.group" }), {
      context: controls.context,
    })

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
          </main>

          <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
        </>
      )
    }
  },
})

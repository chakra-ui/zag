import { injectGlobal } from "@emotion/css"
import * as Toast from "@ui-machines/toast"
import { normalizeProps, useActor, useMachine, useSetup, VuePropTypes } from "@ui-machines/vue"
import { HollowDotsSpinner } from "epic-spinners"
import { computed, defineComponent, h, PropType, ref, Fragment } from "vue"
import { toastStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

injectGlobal(toastStyle)

const ToastItem = defineComponent({
  props: {
    actor: {
      type: Object as PropType<Toast.Service>,
      required: true,
    },
  },
  setup(props) {
    const [state, send] = useActor(props.actor)
    const toast = computed(() => Toast.connect<VuePropTypes>(state.value, send, normalizeProps))

    return () => {
      const { isVisible, containerProps, progress, title, titleProps, type, dismiss } = toast.value
      return (
        <pre class="toast" hidden={!isVisible} {...containerProps}>
          <progress max={progress?.max} value={progress?.value} />
          <p {...titleProps}>{title}</p>
          {/* @ts-expect-error */}
          <p>{type === "loading" ? <HollowDotsSpinner /> : null}</p>
          <button onClick={dismiss}>Close</button>
        </pre>
      )
    }
  },
})

export default defineComponent({
  name: "Toast",
  setup() {
    const [state, send] = useMachine(Toast.group.machine.withContext({ pauseOnHover: true }))
    const toastRef = useSetup({ send, id: "1" })
    const toasts = computed(() => Toast.group.connect<VuePropTypes>(state.value, send, normalizeProps))

    const id = ref<string>()

    return () => {
      return (
        <>
          <div ref={toastRef} style={{ display: "flex", gap: "16px" }}>
            <button
              onClick={() => {
                id.value = toasts.value.create({
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
                toasts.value.create({
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
                toasts.value.update(id.value, {
                  title: "Testing",
                  type: "loading",
                })
              }}
            >
              Update Child (info)
            </button>
            <button onClick={() => toasts.value.dismiss()}>Close all</button>
            <button onClick={() => toasts.value.pause()}>Pause all</button>
            <button onClick={() => toasts.value.resume()}>Resume all</button>
          </div>

          <div {...toasts.value.getContainerProps({ placement: "bottom" })}>
            {toasts.value.toasts.map((actor) => (
              <ToastItem key={actor.id} actor={actor} />
            ))}
          </div>

          <StateVisualizer state={state} />
        </>
      )
    }
  },
})

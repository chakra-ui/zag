import { computed, h, Fragment, defineComponent, ref, PropType } from "vue"
import { useMachine, normalizeProps, useActor } from "@ui-machines/vue"
import { toast, ToastMachine } from "@ui-machines/web"
import { HollowDotsSpinner } from "epic-spinners"
import { StateVisualizer } from "../components/state-visualizer"
import { useMount } from "../hooks/use-mount"
import { env } from "shelljs"

if (typeof global === "undefined" && typeof window !== "undefined") {
  window.global = window
}

const backgrounds = {
  error: "red",
  blank: "lightgray",
  warning: "orange",
  loading: "pink",
} as any

const Toast = defineComponent({
  props: {
    actor: {
      type: Object as PropType<ToastMachine>,
      required: true,
    },
  },
  setup(props) {
    const [state, send] = useActor(props.actor)
    const ctx = computed(() => state.value.context)

    const t = computed(() => toast.connect(state.value, send))

    return () => (
      <pre
        hidden={!t.value.isVisible}
        style={{ padding: "10px", background: backgrounds[ctx.value.type], maxWidth: "400px" }}
        // @ts-expect-error
        onPointerenter={t.value.pause}
        onPointerleave={t.value.resume}
      >
        <progress max={ctx.value.progress?.max} value={ctx.value.progress?.value} />
        <p>{ctx.value.title}</p>
        {/* @ts-expect-error */}
        <p>{ctx.value.type === "loading" ? <HollowDotsSpinner /> : null}</p>
        <button onClick={t.value.dismiss}>Close</button>
      </pre>
    )
  },
})

export default defineComponent({
  name: "Toast",
  setup() {
    const [state, send] = useMachine(toast.group.machine)

    const _ref = useMount(send)
    const toasts = computed(() => toast.group.connect(state.value, send, normalizeProps))
    const id = ref<string>()

    return () => {
      return (
        <div ref={_ref}>
          <button
            onClick={() => {
              id.value = toasts.value.create({
                title: "Welcome",
                description: "Welcome",
                type: "blank",
              })
            }}
          >
            Notify
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
            Update Child
          </button>
          <button onClick={() => toasts.value.dismiss()}>Close all</button>
          <button onClick={() => toasts.value.pause()}>Pause</button>
          <div>
            {state.value.context.toasts.map((actor) => (
              // @ts-expect-error
              <Toast key={actor.id} actor={actor} />
            ))}
          </div>
        </div>
      )
    }
  },
})

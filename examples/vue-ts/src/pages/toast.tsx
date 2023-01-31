import { toastControls } from "@zag-js/shared"
import * as toast from "@zag-js/toast"
import { normalizeProps, useActor, useMachine, type MachineRuntimeScope } from "@zag-js/vue"
import { HollowDotsSpinner } from "epic-spinners"
import { onMounted, type ComputedRef, type PropType, type Ref } from "vue"
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

const [globalState, globalSend] = useMachine(toast.group.machine({ id: "toast.group.global" }), {
  context: ref({
    pauseOnInteraction: true,
  }),
  scope: "global",
})

const GlobalScopeToast = defineComponent({
  name: "GlobalScopeToast",
  setup() {
    const controls = useControls(toastControls)
    const apiRef = computed(() => toast.group.connect(globalState.value, globalSend, normalizeProps))
    const id = ref<string>()
    onMounted(() => {
      // @ts-ignore
      window.toastApi = apiRef.value
    })
    return createRenderFunction(apiRef, id, controls, globalState, "global" as MachineRuntimeScope)
  },
})

const ComponentScopeToast = defineComponent({
  name: "ComponentScopeToast",
  setup() {
    const controls = useControls(toastControls)
    const [state, send] = useMachine(toast.group.machine({ id: "toast.group.local" }), {
      context: controls.context,
    })
    const apiRef = computed(() => toast.group.connect(state.value, send, normalizeProps))
    const id = ref<string>()
    return createRenderFunction(apiRef, id, controls, state, "component")
  },
})

function createRenderFunction(
  apiRef: ComputedRef<ReturnType<typeof toast.group.connect>>,
  id: Ref<string | undefined>,
  controls: any,
  state: any,
  scope: MachineRuntimeScope,
) {
  return () => {
    const api = apiRef.value
    return (
      <>
        <main>
          <h2>toast scope: {scope}</h2>
          {scope === "global" && <h4>{"try window.toastApi(...)"}</h4>}
          <div style={{ display: "flex", gap: "16px" }}>
            <button
              onClick={() => {
                id.value = api.create({
                  title: `${scope}::"Welcome"`,
                  description: "Welcome",
                  type: "info",
                  placement: scope === "component" ? "bottom-start" : "bottom-end",
                })
              }}
            >
              Notify (Info)
            </button>
            <button
              onClick={() => {
                api.create({
                  title: `${scope}::"Ooops! Something was wrong"`,
                  type: "error",
                  placement: scope === "component" ? "bottom-start" : "bottom-end",
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

        <Toolbar controls={controls.ui}>
          <StateVisualizer state={state} />
        </Toolbar>
      </>
    )
  }
}

export default defineComponent({
  name: "Toast",
  setup() {
    return () => (
      <section>
        <ComponentScopeToast />
        <hr></hr>
        <GlobalScopeToast />
      </section>
    )
  },
})

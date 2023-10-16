import { normalizeProps, useActor, useMachine } from "@zag-js/react"
import { toastControls } from "@zag-js/shared"
import * as toast from "@zag-js/toast"
import { useId, useRef } from "react"
import { BeatLoader } from "react-spinners"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

function ToastItem({ actor }: { actor: toast.Service }) {
  const [state, send] = useActor(actor)
  const api = toast.connect(state, send, normalizeProps)

  const progressbarProps = {
    "data-scope": "toast",
    "data-part": "progressbar",
    "data-type": state.context.type,
    style: {
      opacity: api.isVisible ? 1 : 0,
      transformOrigin: api.isRtl ? "right" : "left",
      animationName: api.type === "loading" ? "none" : undefined,
      animationPlayState: api.isPaused ? "paused" : "running",
      animationDuration: "var(--duration)",
    },
  }

  if (state.context.render) {
    return state.context.render(api)
  }

  return (
    <pre {...api.rootProps}>
      <div {...progressbarProps} />
      <p {...api.titleProps}>{api.title}</p>
      <p {...api.descriptionProps}>{api.description}</p>
      <p>{api.type === "loading" ? <BeatLoader /> : null}</p>
      <button {...api.closeTriggerProps}>Close</button>
    </pre>
  )
}

export default function Page() {
  const controls = useControls(toastControls)

  const [state, send] = useMachine(
    toast.group.machine({
      id: useId(),
      placement: "top-start",
    }),
    {
      context: controls.context,
    },
  )

  const api = toast.group.connect(state, send, normalizeProps)

  const placements = Object.keys(api.toastsByPlacement) as toast.Placement[]
  const id = useRef<string>()

  return (
    <>
      <main>
        <div style={{ display: "flex", gap: "16px" }}>
          <button
            onClick={() => {
              id.current = api.create({
                title: "Welcome",
                description: "This a notification",
                type: "info",
              })
            }}
          >
            Notify (Info)
          </button>
          <button
            onClick={() => {
              api.create({
                placement: "bottom-start",
                title: "Ooops! Something was wrong",
                type: "error",
              })
            }}
          >
            Notify (Error)
          </button>
          <button
            onClick={() => {
              if (!id.current) return
              api.update(id.current, {
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
        {placements.map((placement) => (
          <div key={placement} {...api.getGroupProps({ placement })}>
            {api.toastsByPlacement[placement].map((actor) => (
              <ToastItem key={actor.id} actor={actor} />
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

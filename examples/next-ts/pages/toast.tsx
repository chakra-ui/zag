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

  return (
    <pre {...api.rootProps}>
      <div {...api.progressbarProps} />
      <p {...api.titleProps}>{api.title}</p>
      <p {...api.descriptionProps}>{api.description}</p>
      <p>{api.type === "loading" ? <BeatLoader /> : null}</p>
      <button onClick={api.dismiss}>Close</button>
    </pre>
  )
}

export default function Page() {
  const controls = useControls(toastControls)

  const [state, send] = useMachine(
    toast.group.machine({
      id: useId(),
    }),
    {
      context: controls.context,
    },
  )

  const api = toast.group.connect(state, send, normalizeProps)

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
        <div className="toast-group" {...api.getGroupProps({ placement: "bottom" })}>
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

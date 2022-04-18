import { Global } from "@emotion/react"
import { useActor, useMachine, useSetup } from "@zag-js/react"
import * as toast from "@zag-js/toast"
import { useRef } from "react"
import { BeatLoader } from "react-spinners"
import { toastControls } from "../../../shared/controls"
import { toastStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

function ToastItem({ actor }: { actor: toast.Service }) {
  const [state, send] = useActor(actor)
  const api = toast.connect(state, send)

  return (
    <pre {...api.rootProps}>
      <div {...api.progressbarProps} />
      <p {...api.titleProps}>{api.title}</p>
      <p>{api.type === "loading" ? <BeatLoader /> : null}</p>
      <button onClick={api.dismiss}>Close</button>
    </pre>
  )
}

export default function Page() {
  const controls = useControls(toastControls)

  const [state, send] = useMachine(toast.group.machine, {
    context: controls.context,
  })

  const ref = useSetup({ send, id: "1" })
  const api = toast.group.connect(state, send)

  const id = useRef<string>()

  return (
    <>
      <Global styles={toastStyle} />

      <main>
        <controls.ui />
        <div ref={ref} style={{ display: "flex", gap: "16px" }}>
          <button
            onClick={() => {
              id.current = api.create({
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
        <div {...api.getGroupProps({ placement: "bottom" })}>
          {api.toasts.map((actor) => (
            <ToastItem key={actor.id} actor={actor} />
          ))}
        </div>
      </main>
      <StateVisualizer state={state} />
    </>
  )
}

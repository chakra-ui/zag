import { Global } from "@emotion/react"
import { useActor, useMachine, useSetup } from "@ui-machines/react"
import * as Toast from "@ui-machines/toast"
import { useRef } from "react"
import { BeatLoader } from "react-spinners"
import { toastStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"

function ToastItem({ actor }: { actor: Toast.Service }) {
  const [state, send] = useActor(actor)
  const toast = Toast.connect(state, send)

  return (
    <pre className="toast" {...toast.containerProps}>
      <progress max={toast.progress?.max} value={toast.progress?.value} />
      <p {...toast.titleProps}>{toast.title}</p>
      <p>{toast.type === "loading" ? <BeatLoader /> : null}</p>
      <button onClick={toast.dismiss}>Close</button>
    </pre>
  )
}

export default function Page() {
  const [state, send] = useMachine(Toast.group.machine)

  const ref = useSetup<HTMLDivElement>({ send, id: "1" })

  const toasts = Toast.group.connect(state, send)
  const id = useRef<string>()

  return (
    <>
      <Global styles={toastStyle} />

      <div ref={ref} style={{ display: "flex", gap: "16px" }}>
        <button
          onClick={() => {
            id.current = toasts.create({
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
            toasts.create({
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
            toasts.update(id.current, {
              title: "Testing",
              type: "loading",
            })
          }}
        >
          Update Child (info)
        </button>
        <button onClick={() => toasts.dismiss()}>Close all</button>
        <button onClick={() => toasts.pause()}>Pause all</button>
        <button onClick={() => toasts.resume()}>Resume all</button>
      </div>

      <div {...toasts.getContainerProps({ placement: "bottom" })}>
        {toasts.toasts.map((actor) => (
          <ToastItem key={actor.id} actor={actor} />
        ))}
      </div>

      <StateVisualizer state={state} />
    </>
  )
}

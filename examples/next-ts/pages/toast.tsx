/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Global } from "@emotion/react"
import { useActor, useMachine } from "@ui-machines/react"
import { toast, ToastMachine } from "@ui-machines/toast"
import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"
import { useRef } from "react"
import { BeatLoader } from "react-spinners"
import { toastStyle } from "../../../shared/style"

const Toast = ({ actor }: { actor: ToastMachine }) => {
  const [state, send] = useActor(actor)

  const ctx = state.context

  const t = toast.connect(state, send)

  // call `t.render()` if provided, else use default ui below

  return (
    <pre className="toast" {...t.containerProps}>
      <progress max={ctx.progress?.max} value={ctx.progress?.value} />
      <p>{ctx.title}</p>
      <p>{ctx.type === "loading" ? <BeatLoader /> : null}</p>
      <button onClick={t.dismiss}>Close</button>
    </pre>
  )
}

export default function Page() {
  const [state, send] = useMachine(toast.group.machine)
  const { context: ctx } = state

  const ref = useMount<HTMLDivElement>(send)

  const toasts = toast.group.connect(state, send)
  const id = useRef<string>()

  return (
    <div ref={ref}>
      <Global styles={toastStyle} />

      <div style={{ display: "flex", gap: "16px" }}>
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
        {ctx.toasts.map((actor) => (
          <Toast key={actor.id} actor={actor} />
        ))}
      </div>
      <StateVisualizer state={state} />
    </div>
  )
}

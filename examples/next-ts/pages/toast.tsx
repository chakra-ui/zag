import { toast, ToastMachine } from "@ui-machines/web"
import { useActor, useMachine } from "@ui-machines/react"
import { useMount } from "hooks/use-mount"
import { useRef } from "react"
import { BeatLoader } from "react-spinners"

const backgrounds = {
  error: "red",
  blank: "lightgray",
  warning: "orange",
  loading: "pink",
} as any

const Toast = ({ actor }: { actor: ToastMachine }) => {
  const [state, send] = useActor(actor)
  const ctx = state.context

  const t = toast.connect(state, send)

  return (
    <pre
      hidden={!t.isVisible}
      style={{ padding: 10, background: backgrounds[ctx.type], maxWidth: 400 }}
      onPointerEnter={t.pause}
      onPointerLeave={t.resume}
    >
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
      <button
        onClick={() => {
          id.current = toasts.create({
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
          if (!id.current) return
          toasts.update(id.current, {
            title: "Testing",
            type: "loading",
          })
        }}
      >
        Update Child
      </button>
      <button onClick={() => toasts.dismiss()}>Close all</button>
      <button onClick={() => toasts.pause()}>Pause</button>
      <div>
        {ctx.toasts.map((actor) => (
          <Toast key={actor.id} actor={actor} />
        ))}
      </div>
    </div>
  )
}

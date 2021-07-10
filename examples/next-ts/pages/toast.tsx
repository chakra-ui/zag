import { useActor, useMachine } from "@ui-machines/react"
import { toastsMachine, ToastMachine } from "@ui-machines/dom"
import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"

const Toast = ({ actor }: { actor: ToastMachine }) => {
  const [state, send] = useActor(actor)
  return (
    <pre style={{ padding: 10 }}>
      <p>{state.context.title}</p>
      <StateVisualizer
        state={state}
        reset
        style={{ display: "inline-block" }}
      />
      <button onClick={() => send("DISMISS")}>Close</button>
    </pre>
  )
}

function Page() {
  const [state, send] = useMachine(toastsMachine)
  const { context: ctx } = state

  const ref = useMount<HTMLDivElement>(send)

  return (
    <div className="App" ref={ref}>
      <button
        onClick={() =>
          send({
            type: "ADD_TOAST",
            toast: {
              title: "Welcome",
              description: "Welcome",
              type: "black",
              // id: "test",
            },
          })
        }
      >
        Notify
      </button>
      <button
        onClick={() =>
          send({
            type: "UPDATE_TOAST",
            id: "test",
            toast: { title: "Testing" },
          })
        }
      >
        Update Child
      </button>
      <button onClick={() => send("DISMISS_ALL")}>Close all</button>
      <div>
        {ctx.toasts.map((actor) => (
          <Toast key={actor.id} actor={actor} />
        ))}
      </div>
    </div>
  )
}

export default Page

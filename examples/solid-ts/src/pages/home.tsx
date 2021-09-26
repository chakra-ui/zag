import { createMachine } from "@ui-machines/core"
import { useMachine } from "@ui-machines/solid"

const counter = createMachine(
  {
    id: "counter",
    context: {
      value: 3,
    },
    computed: {
      isAbove: (ctx) => ctx.value > 10,
    },
    initial: "idle",
    states: {
      idle: {
        on: {
          INC: "running",
        },
      },
      running: {
        every: { 50: "increment" },
        on: {
          INC: "idle",
        },
      },
    },
  },
  {
    actions: {
      increment: (ctx) => {
        ctx.value += 1
      },
    },
  },
)

export default function Home() {
  const [state, send] = useMachine(counter)
  return (
    <div>
      <header>
        <p>{state.context.value}</p>
        <button onClick={() => send("INC")}>Increment</button>
        <button disabled={state.matches("running")}>Running</button>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </header>
    </div>
  )
}

import { useMachine } from "@ui-machines/solid"
import { createMachine } from "@ui-machines/core"

const counter = createMachine(
  {
    id: "counter",
    context: {
      value: 3,
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
    <div class="App">
      <header class="App-header">
        <p>{state().context.value}</p>
        <button onClick={() => send("INC")}>Increment</button>
      </header>
    </div>
  )
}

import { createMachine } from "@ui-machines/core"
import { useMachine } from "@ui-machines/solid"
import { createEffect } from "solid-js"

const counter = createMachine(
  {
    id: "counter",
    context: {
      value: 3,
      isReady: false,
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
          DEC: { actions: ["decrement"] },
        },
      },
    },
  },
  {
    actions: {
      increment: (ctx) => {
        ctx.value += 1
      },
      decrement: (ctx) => {
        ctx.value -= 1
      },
    },
  },
)

export default function Home() {
  const [state, send] = useMachine(counter)

  createEffect(() => {
    console.log("Off", state.context.isReady)
  })

  return (
    <div class="App">
      <header class="App-header">
        <p>{state.context.value}</p>
        <button onClick={() => send("INC")}>Increment</button>
        <button disabled={state.matches("running")}>Running</button>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </header>
    </div>
  )
}

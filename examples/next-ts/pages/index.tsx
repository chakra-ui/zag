import { createMachine } from "@ui-machines/core"
import { useMachine } from "@ui-machines/react"
import { StateVisualizer } from "components/state-visualizer"

const timerMachine = createMachine(
  {
    context: {
      duration: 3000,
      value: 3000,
    },
    initial: "idle",
    states: {
      idle: {
        on: {
          DISMISS: "dismissing",
        },
      },
      temp: {
        after: {
          0: {
            target: "dismissing",
            actions: console.log,
          },
        },
      },
      dismissing: {
        every: { 10: "setValue" },
        after: {
          DURATION: "closed",
        },
        on: {
          SET_DURATION: {
            target: "temp",
            actions: "setDuration",
          },
        },
      },
      closed: {
        on: {},
      },
    },
  },
  {
    delays: {
      DURATION: (ctx) => ctx.duration,
    },
    actions: {
      setValue(ctx) {
        ctx.value -= 10
      },
      setDuration(ctx, evt) {
        ctx.duration = evt.value
        ctx.value = evt.value
      },
    },
  },
)

const IndexPage = () => {
  const [state, send] = useMachine(timerMachine)
  return (
    <div>
      <button onClick={() => send("DISMISS")}>DISMISS</button>
      <button onClick={() => send({ type: "SET_DURATION", value: 5000 })}>
        Change duration (5000ms)
      </button>
      <div>{state.context.value}</div>
      <StateVisualizer state={state} />
    </div>
  )
}

export default IndexPage

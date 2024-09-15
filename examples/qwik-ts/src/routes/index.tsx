import { $, component$, noSerialize, useComputed$ } from "@builder.io/qwik"
import type { DocumentHead } from "@builder.io/qwik-city"
import { createMachine } from "@zag-js/core"
import { useMachine } from "~/hooks/use-machine"

const machine = (count: number) => {
  return createMachine({
    context: { count },
    initial: "idle",
    states: {
      idle: {
        on: {
          INCREMENT: {
            actions(ctx) {
              ctx.count += 1
            },
          },
        },
      },
    },
  })
}

function connect(state: any, send: any) {
  return {
    count: state.context.count,
    buttonProps: {
      "data-count": state.context.count,
      disabled: state.context.count >= 15,
      onClick$: $(() => {
        send("INCREMENT")
      }),
    },
  }
}

export default component$(() => {
  const [state, send] = useMachine({
    qrl: $(() => noSerialize(machine(10))),
    initialState: noSerialize(machine(10).getState()),
  })

  const api = useComputed$(() => connect(state.value, send))

  return (
    <>
      <h1>Hi 👋</h1>
      <div>
        Count is: {api.value.count}
        <br />
        <button {...api.value.buttonProps}>Increment</button>
      </div>
    </>
  )
})

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
}

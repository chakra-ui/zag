import { $, component$, noSerialize, useComputed$, useStore } from "@builder.io/qwik"
import type { DocumentHead } from "@builder.io/qwik-city"
import { createMachine } from "@zag-js/core"
import { useMachine } from "~/hooks/use-machine"

const machine = (props: { count?: number; onCount?: (count: number) => void }) => {
  return createMachine({
    context: { count: 0, ...props },
    initial: "idle",
    states: {
      idle: {
        on: {
          INCREMENT: {
            actions(ctx) {
              ctx.count += 1
              ctx.onCount?.(ctx.count)
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
  const context = useStore({
    count: 10,
  })

  const [state, send] = useMachine(
    {
      qrl: $(() =>
        noSerialize(
          machine({
            onCount(count) {
              context.count = count
            },
          }),
        ),
      ),
      initialState: noSerialize(machine({ count: 10 }).getState()),
    },
    {
      context,
    },
  )

  const api = useComputed$(() => connect(state.value, send))

  return (
    <>
      <h1>Hi 👋</h1>
      <div>
        Count is: {api.value.count}
        <br />
        <button onClick$={() => (context.count += 1)}>Controlled Increment</button>
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

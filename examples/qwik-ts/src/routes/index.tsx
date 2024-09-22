import { $, component$, noSerialize, useStore } from "@builder.io/qwik"
import type { DocumentHead } from "@builder.io/qwik-city"
import { connect } from "../components/button/button.connect"
import { machine } from "../components/button/button.machine"

import { useMachine, normalizeProps } from "@zag-js/qwik"

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

  const api = connect(state.value, send, normalizeProps)

  return (
    <>
      <h1>Hi 👋</h1>
      <div>
        Count is: {api.count}
        <br />
        <button onClick$={() => (context.count += 1)}>Controlled Increment</button>
        <button {...api.getButtonProps()}>Increment</button>
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

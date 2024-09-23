import { $, component$, noSerialize, useSignal } from "@builder.io/qwik"

import { useMachine, normalizeProps } from "@zag-js/qwik"
import * as avatar from "@zag-js/avatar"
import { avatarData } from "@zag-js/shared"
import StateVisualizer from "~/components/state-visualizer"
import Toolbar from "~/components/toolbar"

const images = avatarData.full
const getRandomImage = () => images[Math.floor(Math.random() * images.length)]

export default component$(() => {
  const showImage = useSignal(true)
  const src = useSignal(images[0])

  const [state, send] = useMachine(
    {
      qrl: $(() =>
        noSerialize(
          avatar.machine({
            id: "avatar",
          }),
        ),
      ),
      initialState: noSerialize(avatar.machine({ id: "avatar" }).getState()),
    },
    {
      // context,
    },
  )

  const api = avatar.connect(state.value!, send, normalizeProps)

  return (
    <>
      <main class="avatar">
        <div {...api.getRootProps()}>
          <span {...api.getFallbackProps()}>PA</span>
          {showImage && <img alt="" referrerPolicy="no-referrer" src={src.value} {...api.getImageProps()} />}
        </div>

        <div class="controls">
          <button onClick$={() => (src.value = getRandomImage())}>Change Image</button>
          <button onClick$={() => (src.value = avatarData.broken)}>Broken Image</button>
          <button onClick$={() => (showImage.value = !showImage.value)}>Toggle Image</button>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={state.value!} />
      </Toolbar>
    </>
  )
})

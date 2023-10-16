import * as avatar from "@zag-js/avatar"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import { avatarData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

const images = avatarData.full
const getRandomImage = () => images[Math.floor(Math.random() * images.length)]

export default function Page() {
  const [state, send] = useMachine(avatar.machine({ id: createUniqueId() }))
  const [src, setSrc] = createSignal(images[0])
  const [showImage, setShowImage] = createSignal(true)

  const api = createMemo(() => avatar.connect(state, send, normalizeProps))

  return (
    <>
      <main class="avatar">
        <div {...api().rootProps}>
          <span {...api().fallbackProps}>PA</span>
          {showImage() && <img alt="" referrerPolicy="no-referrer" src={src()} {...api().imageProps} />}
        </div>

        <div class="controls">
          <button onClick={() => setSrc(getRandomImage())}>Change Image</button>
          <button onClick={() => setSrc(avatarData.broken)}>Broken Image</button>
          <button onClick={() => setShowImage((c) => !c)}>Toggle Image</button>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}

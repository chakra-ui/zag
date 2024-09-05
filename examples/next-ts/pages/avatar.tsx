import * as avatar from "@zag-js/avatar"
import { avatarData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

const images = avatarData.full
const getRandomImage = () => images[Math.floor(Math.random() * images.length)]

export default function Page() {
  const [state, send] = useMachine(avatar.machine({ id: useId() }))
  const [src, setSrc] = useState(images[0])
  const [showImage, setShowImage] = useState(true)
  const [name, setName] = useState("PA")

  const api = avatar.connect(state, send, normalizeProps)

  return (
    <>
      <main className="avatar">
        <div {...api.getRootProps()}>
          <span {...api.getFallbackProps()}>{name}</span>
          {showImage && <img alt="" referrerPolicy="no-referrer" src={src} {...api.getImageProps()} />}
        </div>

        <div className="controls">
          <button onClick={() => setSrc(getRandomImage())}>Change Image</button>
          <button onClick={() => setSrc(avatarData.broken)}>Broken Image</button>
          <button onClick={() => setShowImage((c) => !c)}>Toggle Image</button>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}

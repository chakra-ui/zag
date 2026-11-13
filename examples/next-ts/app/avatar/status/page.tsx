"use client"

import * as avatar from "@zag-js/avatar"
import { normalizeProps, useMachine } from "@zag-js/react"
import { avatarData } from "@zag-js/shared"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/avatar.css"

const images = avatarData.full

export default function Page() {
  const [log, setLog] = useState<string[]>([])
  const service = useMachine(avatar.machine, {
    id: useId(),
    onStatusChange({ status }) {
      setLog((prev) => [...prev, status])
    },
  })

  const [index, setIndex] = useState(0)
  const [src, setSrc] = useState(images[0])
  const [showImage, setShowImage] = useState(true)
  const [wrapped, setWrapped] = useState(false)

  const api = avatar.connect(service, normalizeProps)

  const nextImage = () => {
    const next = (index + 1) % images.length
    setIndex(next)
    setSrc(images[next])
  }

  const image = <img alt="" referrerPolicy="no-referrer" src={src} {...api.getImageProps()} />

  return (
    <>
      <main className="avatar">
        <div {...api.getRootProps()}>
          <span {...api.getFallbackProps()}>PA</span>
          {showImage && (wrapped ? <picture>{image}</picture> : image)}
        </div>

        <div className="controls">
          <button onClick={nextImage}>Next image</button>
          <button onClick={() => setSrc(avatarData.broken)}>Broken image</button>
          <button onClick={() => setShowImage((v) => !v)}>Toggle image</button>
          <button onClick={() => setWrapped((v) => !v)}>Wrap in picture: {String(wrapped)}</button>
        </div>

        <p>
          Status: <output aria-label="Load status">{api.status}</output>
        </p>
        <p>
          onStatusChange: <output aria-label="Status reports">{log.join(",") || "-"}</output>
        </p>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

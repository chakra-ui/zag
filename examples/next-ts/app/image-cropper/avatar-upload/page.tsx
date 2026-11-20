"use client"

import * as imageCropper from "@zag-js/image-cropper"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useEffect, useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/image-cropper.css"

export default function Page() {
  const [src, setSrc] = useState("")
  const [zoom, setZoom] = useState(1)
  const [avatar, setAvatar] = useState("")

  const service = useMachine(imageCropper.machine, {
    id: useId(),
    cropShape: "circle",
    aspectRatio: 1,
    zoom,
    onZoomChange: (details) => setZoom(details.zoom),
  })
  const api = imageCropper.connect(service, normalizeProps)

  useEffect(() => {
    if (!src) return
    return () => URL.revokeObjectURL(src)
  }, [src])

  const startOver = () => {
    setSrc("")
    setAvatar("")
    setZoom(1)
  }

  return (
    <>
      <main>
        <div className="image-cropper-avatar-upload">
          <p className="hint">Pick a photo from your device, frame your face in the circle, then save.</p>
          {!src ? (
            <label className="picker">
              <span>Choose a photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const { files } = event.currentTarget
                  if (!files || files.length === 0) return
                  setSrc(URL.createObjectURL(files[0]))
                }}
              />
            </label>
          ) : (
            <>
              <div {...api.getRootProps()}>
                <div {...api.getViewportProps()}>
                  <img src={src} alt="Selected for your avatar" {...api.getImageProps()} />
                  <div {...api.getSelectionProps()} />
                </div>
              </div>
              <label className="zoom">
                <span>Zoom</span>
                <input
                  type="range"
                  aria-label="Zoom"
                  min={service.prop("minZoom")}
                  max={service.prop("maxZoom")}
                  step={0.1}
                  value={zoom}
                  onChange={(event) => api.setZoom(Number(event.currentTarget.value))}
                />
              </label>
              <div className="actions">
                <button
                  type="button"
                  onClick={async () => {
                    const url = await api.getCroppedImage({ output: "dataUrl", type: "image/png" })
                    if (typeof url === "string") setAvatar(url)
                  }}
                >
                  Save avatar
                </button>
                <button type="button" onClick={startOver}>
                  Choose another photo
                </button>
              </div>
            </>
          )}
          {avatar && <img className="avatar-preview" src={avatar} alt="Your new avatar" />}
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} context={["naturalSize", "crop", "zoom"]} />
      </Toolbar>
    </>
  )
}

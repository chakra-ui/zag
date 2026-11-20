import * as imageCropper from "@zag-js/image-cropper"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, onCleanup, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/image-cropper.css"

export default function Page() {
  const id = createUniqueId()
  const [src, setSrc] = createSignal("")
  const [zoom, setZoom] = createSignal(1)
  const [avatar, setAvatar] = createSignal("")

  const service = useMachine(imageCropper.machine, (): imageCropper.Props => ({
    id,
    cropShape: "circle",
    aspectRatio: 1,
    zoom: zoom(),
    onZoomChange: (details) => setZoom(details.zoom),
  }))
  const api = createMemo(() => imageCropper.connect(service, normalizeProps))

  const replaceSrc = (next: string) => {
    if (src()) URL.revokeObjectURL(src())
    setSrc(next)
  }
  onCleanup(() => replaceSrc(""))

  return (
    <>
      <main>
        <div class="image-cropper-avatar-upload">
          <Show
            when={src()}
            fallback={
              <label class="picker">
                <span>Choose a photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const { files } = event.currentTarget
                    if (!files || files.length === 0) return
                    replaceSrc(URL.createObjectURL(files[0]))
                  }}
                />
              </label>
            }
          >
            <div {...api().getRootProps()}>
              <div {...api().getViewportProps()}>
                <img src={src()} alt="Selected for your avatar" {...api().getImageProps()} />
                <div {...api().getSelectionProps()} />
              </div>
            </div>
            <label class="zoom">
              <span>Zoom</span>
              <input
                type="range"
                aria-label="Zoom"
                min={service.prop("minZoom")}
                max={service.prop("maxZoom")}
                step={0.1}
                value={zoom()}
                onInput={(event) => api().setZoom(Number(event.currentTarget.value))}
              />
            </label>
            <div class="actions">
              <button
                type="button"
                onClick={async () => {
                  const url = await api().getCroppedImage({ output: "dataUrl", type: "image/png" })
                  if (typeof url === "string") setAvatar(url)
                }}
              >
                Save avatar
              </button>
              <button
                type="button"
                onClick={() => {
                  replaceSrc("")
                  setAvatar("")
                  setZoom(1)
                }}
              >
                Choose another photo
              </button>
            </div>
          </Show>
          <Show when={avatar()}>
            <img class="avatar-preview" src={avatar()} alt="Your new avatar" />
          </Show>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} context={["naturalSize", "crop", "zoom"]} />
      </Toolbar>
    </>
  )
}

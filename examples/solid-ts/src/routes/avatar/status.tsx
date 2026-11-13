import * as avatar from "@zag-js/avatar"
import { avatarData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/avatar.css"

const images = avatarData.full

export default function Page() {
  const [log, setLog] = createSignal<string[]>([])
  const service = useMachine(avatar.machine, {
    id: createUniqueId(),
    onStatusChange({ status }) {
      setLog((prev) => [...prev, status])
    },
  })

  const [index, setIndex] = createSignal(0)
  const [src, setSrc] = createSignal(images[0])
  const [showImage, setShowImage] = createSignal(true)
  const [wrapped, setWrapped] = createSignal(false)

  const api = createMemo(() => avatar.connect(service, normalizeProps))

  const nextImage = () => {
    const next = (index() + 1) % images.length
    setIndex(next)
    setSrc(images[next])
  }

  const Image = () => <img alt="" referrerpolicy="no-referrer" src={src()} {...api().getImageProps()} />

  return (
    <>
      <main class="avatar">
        <div {...api().getRootProps()}>
          <span {...api().getFallbackProps()}>PA</span>
          <Show when={showImage()}>
            <Show when={wrapped()} fallback={<Image />}>
              <picture>
                <Image />
              </picture>
            </Show>
          </Show>
        </div>

        <div class="controls">
          <button onClick={nextImage}>Next image</button>
          <button onClick={() => setSrc(avatarData.broken)}>Broken image</button>
          <button onClick={() => setShowImage((v) => !v)}>Toggle image</button>
          <button onClick={() => setWrapped((v) => !v)}>Wrap in picture: {String(wrapped())}</button>
        </div>

        <p>
          Status: <output aria-label="Load status">{api().status}</output>
        </p>
        <p>
          onStatusChange: <output aria-label="Status reports">{log().join(",") || "-"}</output>
        </p>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

import { normalizeProps, useMachine } from "@zag-js/solid"
import * as splitter from "@zag-js/splitter"
import { isEqual } from "@zag-js/utils"
import { createMemo, createSignal, createUniqueId, Show } from "solid-js"
import { usePersistentMapState } from "~/hooks/use-persistent-state"
import "@styles/splitter.css"

export default function Page() {
  const [showInspector, setShowInspector] = createSignal(true)

  const panels = createMemo(
    () =>
      [
        { id: "nav", minSize: 20 },
        { id: "content", minSize: 30 },
        showInspector() && { id: "inspector", minSize: 20 },
      ].filter(Boolean) as splitter.PanelData[],
  )

  const [size, setSize, hydrated] = usePersistentMapState<number[]>({
    storageKey: "zag:splitter:persistent-layout",
    key: () => splitter.layout(panels()),
    defaultValue: [],
  })

  const id = createUniqueId()
  const service = useMachine(splitter.machine, () => ({
    id,
    panels: panels(),
    size: size(),
    onResize: (details) => setSize(details.size),
  }))

  const api = createMemo(() => splitter.connect(service, normalizeProps))

  const ready = createMemo(() => hydrated() && (size().length === 0 || isEqual(api().getSizes(), size())))

  return (
    <main class="splitter" style={{ visibility: ready() ? "visible" : "hidden" }}>
      <pre>{JSON.stringify(api().getSizes())}</pre>
      <button onClick={() => setShowInspector((value) => !value)}>
        {showInspector() ? "Hide Inspector" : "Show Inspector"}
      </button>

      <div {...api().getRootProps()}>
        <div {...api().getPanelProps({ id: "nav" })}>
          <p>Nav</p>
        </div>
        <div {...api().getResizeTriggerProps({ id: "nav:content" })} />
        <div {...api().getPanelProps({ id: "content" })}>
          <p>Content</p>
        </div>
        <Show when={showInspector()}>
          <div {...api().getResizeTriggerProps({ id: "content:inspector" })} />
          <div {...api().getPanelProps({ id: "inspector" })}>
            <p>Inspector</p>
          </div>
        </Show>
      </div>
    </main>
  )
}

import { normalizeProps, useMachine } from "@zag-js/solid"
import * as splitter from "@zag-js/splitter"
import { createMemo, createSignal, createUniqueId, Show } from "solid-js"
import "@styles/splitter.css"

export default function Page() {
  const [hideLeft, setHideLeft] = createSignal(false)
  const [hideRight, setHideRight] = createSignal(false)

  const panels = createMemo(
    () =>
      [
        !hideLeft() && { id: "left", minSize: 20 },
        { id: "center", minSize: 30 },
        !hideRight() && { id: "right", minSize: 20 },
      ].filter(Boolean) as splitter.PanelData[],
  )

  const id = createUniqueId()
  const service = useMachine(splitter.machine, () => ({
    id,
    panels: panels(),
  }))

  const api = createMemo(() => splitter.connect(service, normalizeProps))

  return (
    <main class="splitter">
      <pre>{JSON.stringify(api().getSizes())}</pre>
      <button onClick={() => setHideLeft((value) => !value)}>{hideLeft() ? "Show Left" : "Hide Left"}</button>
      <button onClick={() => setHideRight((value) => !value)}>{hideRight() ? "Show Right" : "Hide Right"}</button>

      <div {...api().getRootProps()}>
        <Show when={!hideLeft()}>
          <div {...api().getPanelProps({ id: "left" })}>
            <p>Left</p>
          </div>
          <div {...api().getResizeTriggerProps({ id: "left:center" })} />
        </Show>

        <div {...api().getPanelProps({ id: "center" })}>
          <p>Center</p>
        </div>

        <Show when={!hideRight()}>
          <div {...api().getResizeTriggerProps({ id: "center:right" })} />
          <div {...api().getPanelProps({ id: "right" })}>
            <p>Right</p>
          </div>
        </Show>
      </div>
    </main>
  )
}

import { normalizeProps, useMachine } from "@zag-js/solid"
import * as toolbar from "@zag-js/toolbar"
import { Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar as ControlsPanel } from "~/components/toolbar"
import "@styles/toolbar.css"

export default function Page() {
  const [showComment, setShowComment] = createSignal(true)
  const service = useMachine(toolbar.machine, { id: createUniqueId() })
  const api = createMemo(() => toolbar.connect(service, normalizeProps))

  return (
    <>
      <main class="toolbar">
        <div {...api().getRootProps()}>
          <button {...api().getItemProps({ value: "cut" })}>Cut</button>
          <button {...api().getItemProps({ value: "copy" })}>Copy</button>
          <button {...api().getItemProps({ value: "paste" })}>Paste</button>
          <Show when={showComment()}>
            <button {...api().getItemProps({ value: "comment" })}>Comment</button>
          </Show>
        </div>
        <label>
          <input
            type="checkbox"
            checked={showComment()}
            onChange={(event) => setShowComment(event.currentTarget.checked)}
          />
          Show Comment button
        </label>
      </main>

      <ControlsPanel viz>
        <StateVisualizer state={service} />
      </ControlsPanel>
    </>
  )
}

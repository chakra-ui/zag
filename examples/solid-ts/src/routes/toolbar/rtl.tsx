import { normalizeProps, useMachine } from "@zag-js/solid"
import * as toolbar from "@zag-js/toolbar"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar as ControlsPanel } from "~/components/toolbar"
import "@styles/toolbar.css"

export default function Page() {
  const [dir, setDir] = createSignal<"ltr" | "rtl">("rtl")
  const id = createUniqueId()
  const service = useMachine(toolbar.machine, () => ({ id, dir: dir() }))
  const api = createMemo(() => toolbar.connect(service, normalizeProps))

  return (
    <>
      <main class="toolbar" dir={dir()}>
        <label>
          <input
            type="checkbox"
            checked={dir() === "rtl"}
            onChange={(e) => setDir(e.currentTarget.checked ? "rtl" : "ltr")}
          />
          RTL
        </label>

        <div {...api().getRootProps()}>
          <button {...api().getItemProps({ value: "cut" })}>Cut</button>
          <button {...api().getItemProps({ value: "copy" })}>Copy</button>
          <button {...api().getItemProps({ value: "paste" })}>Paste</button>
          <button {...api().getItemProps({ value: "select-all" })}>Select All</button>
        </div>

        <p>
          With <code>dir="rtl"</code>, ArrowLeft moves forward (toward the visual start) and ArrowRight moves backward —
          matching reading direction.
        </p>
      </main>

      <ControlsPanel viz>
        <StateVisualizer state={service} />
      </ControlsPanel>
    </>
  )
}

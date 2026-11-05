import { normalizeProps, useMachine } from "@zag-js/solid"
import * as toolbar from "@zag-js/toolbar"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar as ControlsPanel } from "~/components/toolbar"
import "@styles/toolbar.css"

export default function Page() {
  const [log, setLog] = createSignal<string[]>([])
  const service = useMachine(toolbar.machine, { id: createUniqueId() })
  const api = createMemo(() => toolbar.connect(service, normalizeProps))

  function onActivate(label: string) {
    setLog((prev) => [...prev, label].slice(-5))
  }

  return (
    <>
      <main class="toolbar">
        <div {...api().getRootProps()}>
          <button {...api().getItemProps({ value: "cut" })} onClick={() => onActivate("Cut")}>
            Cut
          </button>

          <button
            {...api().getItemProps({ value: "copy", disabled: true, focusableWhenDisabled: false })}
            onClick={() => onActivate("Copy")}
          >
            Copy
          </button>

          <button
            {...api().getItemProps({ value: "paste", disabled: true })}
            onClick={() => {
              if (api().getItemState({ value: "paste", disabled: true }).disabled) return
              onActivate("Paste")
            }}
          >
            Paste
          </button>

          <button {...api().getItemProps({ value: "select-all" })} onClick={() => onActivate("Select All")}>
            Select All
          </button>
        </div>
        <p class="toolbar-note">Activated: {log().join(", ") || "(none)"}</p>
        <p class="toolbar-note">
          Copy is disabled and skipped by the arrow keys. Paste is disabled but stays reachable, so it can still be
          discovered.
        </p>
      </main>

      <ControlsPanel viz>
        <StateVisualizer state={service} />
      </ControlsPanel>
    </>
  )
}

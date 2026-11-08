import * as fieldset from "@zag-js/fieldset"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/field.css"
import "@styles/fieldset.css"

const channels = ["Order updates", "Price drops", "Weekly newsletter"]

export default function Page() {
  const [selected, setSelected] = createSignal<string[]>(["Order updates"])

  const service = useMachine(fieldset.machine, { id: createUniqueId() })
  const api = createMemo(() => fieldset.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="field-page notification-preferences">
          <form onSubmit={(e) => e.preventDefault()}>
            <fieldset {...api().getRootProps()}>
              <legend {...api().getLegendProps()}>Email notifications</legend>
              <span {...api().getHelperTextProps()}>Choose which emails you would like to receive.</span>
              <For each={channels}>
                {(channel) => (
                  <label class="choice">
                    <input
                      type="checkbox"
                      name="notifications"
                      value={channel}
                      checked={selected().includes(channel)}
                      onChange={(e) => {
                        const checked = e.currentTarget.checked
                        setSelected((prev) => (checked ? [...prev, channel] : prev.filter((item) => item !== channel)))
                      }}
                    />
                    {channel}
                  </label>
                )}
              </For>
            </fieldset>
            <div class="actions">
              <button type="button" onClick={() => setSelected(["Order updates"])}>
                Reset
              </button>
            </div>
          </form>
          <p class="summary" role="status" data-testid="summary">
            {selected().length ? `Subscribed to: ${selected().join(", ")}` : "No emails selected"}
          </p>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

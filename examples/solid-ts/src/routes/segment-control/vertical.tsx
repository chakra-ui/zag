import * as radio from "@zag-js/radio-group"
import { settingsSections } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/segmented-control.css"
import "@styles/radio-group.css"

export default function Page() {
  const service = useMachine(radio.machine, {
    id: createUniqueId(),
    name: "section",
    orientation: "vertical",
    defaultValue: "profile",
  })

  const api = createMemo(() => radio.connect(service, normalizeProps))
  const section = () => settingsSections.find((s) => s.id === api().value)!

  return (
    <>
      <main>
        <div class="segmented-control settings-nav">
          <p class="hint">Use the up and down arrow keys to switch sections.</p>
          <div class="layout">
            <div {...api().getRootProps()}>
              <span {...api().getLabelProps()}>Settings section</span>
              <div {...api().getIndicatorProps()} />
              <For each={settingsSections}>
                {(opt) => (
                  <label {...api().getItemProps({ value: opt.id })}>
                    <span {...api().getItemTextProps({ value: opt.id })}>{opt.label}</span>
                    <input {...api().getItemHiddenInputProps({ value: opt.id })} />
                  </label>
                )}
              </For>
            </div>
            <div class="panel" role="region" aria-label={section().label}>
              <p class="title">{section().label}</p>
              <p class="description">{section().description}</p>
            </div>
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

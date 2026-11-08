import * as radio from "@zag-js/radio-group"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { settingsSections } from "@zag-js/shared"
import { useId } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/segmented-control.css"
import "@styles/radio-group.css"

export default function Page() {
  const service = useMachine(radio.machine, {
    id: useId(),
    name: "section",
    orientation: "vertical",
    defaultValue: "profile",
  })

  const api = radio.connect(service, normalizeProps)
  const section = settingsSections.find((s) => s.id === api.value) ?? settingsSections[0]

  return (
    <>
      <main>
        <div className="segmented-control settings-nav">
          <p className="hint">Focus a section and press the up and down arrows.</p>
          <div className="layout">
            <div {...api.getRootProps()}>
              <div {...api.getIndicatorProps()} />
              {settingsSections.map((opt) => (
                <label key={opt.id} data-testid={`radio-${opt.id}`} {...api.getItemProps({ value: opt.id })}>
                  <span {...api.getItemTextProps({ value: opt.id })}>{opt.label}</span>
                  <input {...api.getItemHiddenInputProps({ value: opt.id })} />
                </label>
              ))}
            </div>
            <div className="panel" data-testid="panel">
              <p className="title">{section.label}</p>
              <p className="description">{section.description}</p>
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

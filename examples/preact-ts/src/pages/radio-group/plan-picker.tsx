import * as radio from "@zag-js/radio-group"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { planOptions } from "@zag-js/shared"
import { useId, useState } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/radio-group.css"

export default function Page() {
  const [value, setValue] = useState<string | null>("free")

  const service = useMachine(radio.machine, {
    id: useId(),
    name: "plan",
    value,
    onValueChange: (details) => setValue(details.value),
  })

  const api = radio.connect(service, normalizeProps)
  const selected = planOptions.find((plan) => plan.id === value)

  return (
    <>
      <main>
        <div className="plan-picker">
          <p className="hint">Pick a plan, or use the button to switch to Team.</p>
          <div {...api.getRootProps()}>
            <span {...api.getLabelProps()}>Plan</span>
            {planOptions.map((opt) => (
              <label
                key={opt.id}
                data-testid={`radio-${opt.id}`}
                {...api.getItemProps({ value: opt.id, disabled: opt.disabled })}
              >
                <div {...api.getItemControlProps({ value: opt.id, disabled: opt.disabled })} />
                <span {...api.getItemTextProps({ value: opt.id, disabled: opt.disabled })}>
                  <span className="name">{opt.label}</span>
                  <span className="price">{opt.price}</span>
                  <span className="detail">{opt.note}</span>
                </span>
                <input {...api.getItemHiddenInputProps({ value: opt.id, disabled: opt.disabled })} />
              </label>
            ))}
          </div>
          <p className="selected" data-testid="selected-plan" role="status">
            Selected plan: {selected?.label ?? "None"}
          </p>
          <div className="actions">
            <button type="button" onClick={() => setValue("team")}>
              Switch to Team
            </button>
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

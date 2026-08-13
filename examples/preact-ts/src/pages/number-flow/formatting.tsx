import * as numberFlow from "@zag-js/number-flow"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { numberFlowControls } from "@zag-js/shared"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"
import "@styles/number-flow.css"

const PRESETS = {
  usd: {
    label: "USD Currency (en-US)",
    locale: "en-US",
    formatOptions: { style: "currency", currency: "USD" },
    step: 100,
    defaultValue: 1234.56,
  },
  eur: {
    label: "EUR Currency (de-DE)",
    locale: "de-DE",
    formatOptions: { style: "currency", currency: "EUR" },
    step: 100,
    defaultValue: 1234.56,
  },
  percent: {
    label: "Percent (en-US)",
    locale: "en-US",
    formatOptions: { style: "percent", minimumFractionDigits: 1 },
    step: 0.05,
    defaultValue: 0.256,
  },
  arabic: {
    label: "Arabic-Indic Digits (ar-EG)",
    locale: "ar-EG",
    formatOptions: {},
    step: 100,
    defaultValue: 1234,
  },
  plain: {
    label: "Grouped Plain (en-US)",
    locale: "en-US",
    formatOptions: {},
    step: 1000,
    defaultValue: 1234567,
  },
} satisfies Record<
  string,
  { label: string; locale: string; formatOptions: Intl.NumberFormatOptions; step: number; defaultValue: number }
>

type PresetKey = keyof typeof PRESETS

export default function Page() {
  const controls = useControls(numberFlowControls)
  const [preset, setPreset] = useState<PresetKey>("usd")
  const [value, setValue] = useState(PRESETS.usd.defaultValue)

  const { label: _label, step, ...presetProps } = PRESETS[preset]

  const service = useMachine(numberFlow.machine, {
    id: useId(),
    value,
    ...presetProps,
    ...controls.context,
  })

  const api = numberFlow.connect(service, normalizeProps)

  function changePreset(next: PresetKey) {
    setPreset(next)
    setValue(PRESETS[next].defaultValue)
  }

  return (
    <>
      <main className="number-flow">
        <div {...api.getRootProps()}>
          {api.segments.map((segment) =>
            segment.kind === "digit" ? (
              <span key={segment.key} {...api.getDigitProps({ segment })}>
                <span {...api.getDigitTrackProps({ segment })}>
                  {api.digitCells.map((cell) => (
                    <span key={cell.index} {...api.getDigitCellProps({ segment, cell })}>
                      {cell.glyph}
                    </span>
                  ))}
                </span>
              </span>
            ) : (
              <span key={segment.key} {...api.getSymbolProps({ segment })}>
                {segment.value}
              </span>
            ),
          )}
          <span {...api.getValueTextProps()}>{api.announcedValueText}</span>
        </div>

        <div className="number-flow__actions">
          <select data-testid="preset" value={preset} onChange={(e) => changePreset(e.target.value as PresetKey)}>
            {Object.entries(PRESETS).map(([key, p]) => (
              <option key={key} value={key}>
                {p.label}
              </option>
            ))}
          </select>
          <button data-testid="decrease" onClick={() => setValue((v) => v - step)}>
            -{step}
          </button>
          <button data-testid="increase" onClick={() => setValue((v) => v + step)}>
            +{step}
          </button>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

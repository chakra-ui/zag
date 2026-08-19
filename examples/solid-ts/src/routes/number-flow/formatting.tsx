import * as numberFlow from "@zag-js/number-flow"
import { numberFlowControls } from "@zag-js/shared"
import { Key, normalizeProps, useMachine } from "@zag-js/solid"
import { For, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
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
  const [preset, setPreset] = createSignal<PresetKey>("usd")
  const [value, setValue] = createSignal(PRESETS.usd.defaultValue)

  const current = () => PRESETS[preset()]

  const service = useMachine(
    numberFlow.machine,
    controls.mergeProps<numberFlow.Props>({
      id: createUniqueId(),
      get value() {
        return value()
      },
      get locale() {
        return current().locale
      },
      get formatOptions() {
        return current().formatOptions
      },
    }),
  )

  const api = createMemo(() => numberFlow.connect(service, normalizeProps))

  function changePreset(next: PresetKey) {
    setPreset(next)
    setValue(PRESETS[next].defaultValue)
  }

  return (
    <>
      <main class="number-flow">
        <div {...api().getRootProps()}>
          <Key each={api().segments} by={(segment) => segment.key}>
            {(segment) => {
              // `Key` runs this once per key, so the getters must read `segment()` inside the
              // JSX. `Show` hands its child a narrowed accessor; narrowing does not otherwise
              // survive two calls to the same accessor.
              const digit = createMemo(() => {
                const current = segment()
                return numberFlow.isDigitSegment(current) ? current : null
              })
              const symbol = () => segment() as numberFlow.SymbolSegment

              return (
                <Show
                  when={digit()}
                  fallback={<span {...api().getSymbolProps({ segment: symbol() })}>{symbol().value}</span>}
                >
                  {(segment) => (
                    <span {...api().getDigitProps({ segment: segment() })}>
                      <span {...api().getDigitTrackProps({ segment: segment() })}>
                        <For each={api().digitCells}>
                          {(cell) => (
                            <span {...api().getDigitCellProps({ segment: segment(), cell })}>{cell.glyph}</span>
                          )}
                        </For>
                      </span>
                    </span>
                  )}
                </Show>
              )
            }}
          </Key>
          <span {...api().getValueTextProps()}>{api().announcedValueText}</span>
        </div>

        <div class="number-flow__actions">
          <select
            data-testid="preset"
            value={preset()}
            onChange={(event) => changePreset(event.currentTarget.value as PresetKey)}
          >
            <For each={Object.entries(PRESETS)}>{([key, item]) => <option value={key}>{item.label}</option>}</For>
          </select>
          <button data-testid="decrease" onClick={() => setValue((v) => v - current().step)}>
            -{current().step}
          </button>
          <button data-testid="increase" onClick={() => setValue((v) => v + current().step)}>
            +{current().step}
          </button>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

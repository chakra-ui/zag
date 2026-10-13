import * as numberInput from "@zag-js/number-input"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { MinusIcon, PlusIcon } from "lucide-solid"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/number-input.css"

export default function Page() {
  const [value, setValue] = createSignal("")
  const [formatOptions, setFormatOptions] = createSignal<Intl.NumberFormatOptions | undefined>(undefined)
  const [maxFractionDigits, setMaxFractionDigits] = createSignal<number | undefined>(undefined)
  const [reason, setReason] = createSignal("-")
  const [commits, setCommits] = createSignal(0)
  const [commitReason, setCommitReason] = createSignal("-")
  const [focusReports, setFocusReports] = createSignal<string[]>([])
  const [invalids, setInvalids] = createSignal(0)
  const [invalidReport, setInvalidReport] = createSignal("-")
  const [focusInputOnChange, setFocusInputOnChange] = createSignal(true)
  const [clampValueOnBlur, setClampValueOnBlur] = createSignal(true)

  const id = createUniqueId()

  const service = useMachine(numberInput.machine, () => {
    const digits = maxFractionDigits()
    return {
      id,
      value: value(),
      max: 1000,
      min: 0,
      focusInputOnChange: focusInputOnChange(),
      clampValueOnBlur: clampValueOnBlur(),
      formatOptions: digits !== undefined ? { ...formatOptions(), maximumFractionDigits: digits } : formatOptions(),
      onValueChange(details: numberInput.ValueChangeDetails) {
        setValue(details.value)
        setReason(details.reason ?? "-")
      },
      onFocusChange(details: numberInput.FocusChangeDetails) {
        setFocusReports((prev) => [...prev, details.focused ? "focus" : "blur"].slice(-4))
      },
      onValueInvalid(details: numberInput.ValueInvalidDetails) {
        setInvalids((c) => c + 1)
        setInvalidReport(`${details.reason}:${details.value}`)
      },
      onValueCommit(details: numberInput.ValueChangeDetails) {
        setCommits((c) => c + 1)
        setCommitReason(details.reason ?? "-")
      },
    }
  })

  const api = createMemo(() => numberInput.connect(service, normalizeProps))

  return (
    <>
      <main class="number-input">
        <h2>Controlled Number Input Testing</h2>

        {/* Test buttons for external value changes */}
        <div style={{ "margin-bottom": "1rem", display: "flex", gap: "0.5rem", "flex-wrap": "wrap" }}>
          <button data-testid="set-decimal" onClick={() => setValue("123.456789012345")}>
            Set High Precision (123.456789012345)
          </button>
          <button data-testid="set-simple" onClick={() => setValue("50.25")}>
            Set Simple (50.25)
          </button>
          <button data-testid="set-zero" onClick={() => setValue("0")}>
            Set Zero
          </button>
          <button data-testid="clear-value" onClick={() => setValue("")}>
            Clear (Uncontrolled)
          </button>
          <button data-testid="api-set-value" onClick={() => api().setValue(42)}>
            api.setValue(42)
          </button>
          <button data-testid="toggle-focus-on-change" onClick={() => setFocusInputOnChange((v) => !v)}>
            focusInputOnChange: {String(focusInputOnChange())}
          </button>
          <button data-testid="toggle-clamp-on-blur" onClick={() => setClampValueOnBlur((v) => !v)}>
            clampValueOnBlur: {String(clampValueOnBlur())}
          </button>
        </div>

        {/* Format option controls */}
        <div style={{ "margin-bottom": "1rem", display: "flex", gap: "0.5rem", "flex-wrap": "wrap" }}>
          <button
            data-testid="no-format"
            onClick={() => {
              setFormatOptions(undefined)
              setMaxFractionDigits(undefined)
            }}
          >
            No Format Options
          </button>
          <button
            data-testid="currency-format"
            onClick={() => {
              setFormatOptions({ style: "currency", currency: "USD" })
              setMaxFractionDigits(undefined)
            }}
          >
            Currency Format
          </button>
          <button
            data-testid="precision-2"
            onClick={() => {
              setFormatOptions(undefined)
              setMaxFractionDigits(2)
            }}
          >
            Max 2 Decimals
          </button>
          <button
            data-testid="precision-4"
            onClick={() => {
              setFormatOptions(undefined)
              setMaxFractionDigits(4)
            }}
          >
            Max 4 Decimals
          </button>
        </div>

        <div {...api().getRootProps()}>
          <div data-testid="scrubber" {...api().getScrubberProps()} />
          <label data-testid="label" {...api().getLabelProps()}>
            Controlled Number Input (0-1000):
          </label>
          <div {...api().getControlProps()}>
            <button data-testid="dec-button" {...api().getDecrementTriggerProps()}>
              <MinusIcon />
            </button>
            <input data-testid="input" {...api().getInputProps()} />
            <button data-testid="inc-button" {...api().getIncrementTriggerProps()}>
              <PlusIcon />
            </button>
          </div>
        </div>

        {/* Status display */}
        <div style={{ "margin-top": "1rem", padding: "1rem", "background-color": "#f5f5f5", "border-radius": "4px" }}>
          <div>
            <strong>Change Reason:</strong> <span data-testid="reason">{reason()}</span>
            <br />
            <strong>Focus reports:</strong> <span data-testid="focus-reports">{focusReports().join(",") || "-"}</span>
            <br />
            <strong>Invalids:</strong> <span data-testid="invalids">{invalids()}</span>{" "}
            <span data-testid="invalid-report">{invalidReport()}</span>
            <br />
            <strong>Commits:</strong> <span data-testid="commits">{commits()}</span>{" "}
            <span data-testid="commit-reason">{commitReason()}</span>
            <br />
            <strong>Controlled Value:</strong> "{value()}"
          </div>
          <div>
            <strong>Is Controlled:</strong> {value() !== "" ? "Yes" : "No"}
          </div>
          <div>
            <strong>Format Options:</strong> {formatOptions() ? JSON.stringify(formatOptions()) : "None"}
          </div>
          <div>
            <strong>Max Fraction Digits:</strong> {maxFractionDigits() ?? "None"}
          </div>
          <div>
            <strong>Value As Number:</strong> {api().valueAsNumber}
          </div>
        </div>

        <div style={{ "margin-top": "1rem", padding: "1rem", "background-color": "#e8f4fd", "border-radius": "4px" }}>
          <h3>Testing Instructions</h3>
          <ul style={{ "font-size": "0.875rem", "line-height": "1.4" }}>
            <li>
              <strong>Controlled Mode:</strong> When you set a value using buttons above, input is controlled
            </li>
            <li>
              <strong>Uncontrolled Mode:</strong> When you clear the value, input becomes uncontrolled
            </li>
            <li>
              <strong>Precision Test:</strong> Set high precision value, then type to see how precision is preserved
            </li>
            <li>
              <strong>Format Test:</strong> Apply different formats to see controlled vs uncontrolled behavior
            </li>
            <li>
              <strong>External Changes:</strong> Use buttons to change value externally while typing
            </li>
          </ul>
        </div>
      </main>
    </>
  )
}

"use client"

import * as numberInput from "@zag-js/number-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import "@styles/number-input.css"

export default function Page() {
  const [value, setValue] = useState("")
  const [formatOptions, setFormatOptions] = useState<Intl.NumberFormatOptions | undefined>(undefined)
  const [maxFractionDigits, setMaxFractionDigits] = useState<number | undefined>(undefined)
  const [reason, setReason] = useState("-")
  const [commits, setCommits] = useState(0)
  const [commitReason, setCommitReason] = useState("-")
  const [focusReports, setFocusReports] = useState<string[]>([])
  const [invalids, setInvalids] = useState(0)
  const [invalidReport, setInvalidReport] = useState("-")
  const [focusInputOnChange, setFocusInputOnChange] = useState(true)
  const [clampValueOnBlur, setClampValueOnBlur] = useState(true)

  const service = useMachine(numberInput.machine, {
    id: useId(),
    value: value,
    max: 1000,
    min: 0,
    focusInputOnChange,
    clampValueOnBlur,
    formatOptions:
      maxFractionDigits !== undefined ? { ...formatOptions, maximumFractionDigits: maxFractionDigits } : formatOptions,
    onValueChange(details) {
      setValue(details.value)
      setReason(details.reason ?? "-")
    },
    onFocusChange(details) {
      setFocusReports((prev) => [...prev, details.focused ? "focus" : "blur"].slice(-4))
    },
    onValueInvalid(details) {
      setInvalids((c) => c + 1)
      setInvalidReport(`${details.reason}:${details.value}`)
    },
    onValueCommit(details) {
      setCommits((c) => c + 1)
      setCommitReason(details.reason ?? "-")
    },
  })

  const api = numberInput.connect(service, normalizeProps)

  return (
    <>
      <main className="number-input">
        <h2>Controlled Number Input Testing</h2>

        {/* Test buttons for external value changes */}
        <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
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
          <button data-testid="api-set-value" onClick={() => api.setValue(42)}>
            api.setValue(42)
          </button>
          <button data-testid="toggle-focus-on-change" onClick={() => setFocusInputOnChange((v) => !v)}>
            focusInputOnChange: {String(focusInputOnChange)}
          </button>
          <button data-testid="toggle-clamp-on-blur" onClick={() => setClampValueOnBlur((v) => !v)}>
            clampValueOnBlur: {String(clampValueOnBlur)}
          </button>
        </div>

        {/* Format option controls */}
        <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
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

        <div {...api.getRootProps()}>
          <div data-testid="scrubber" {...api.getScrubberProps()} />
          <label data-testid="label" {...api.getLabelProps()}>
            Controlled Number Input (0-1000):
          </label>
          <div {...api.getControlProps()}>
            <button data-testid="dec-button" {...api.getDecrementTriggerProps()}>
              DEC
            </button>
            <input data-testid="input" {...api.getInputProps()} />
            <button data-testid="inc-button" {...api.getIncrementTriggerProps()}>
              INC
            </button>
          </div>
        </div>

        {/* Status display */}
        <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
          <div>
            <strong>Change Reason:</strong> <span data-testid="reason">{reason}</span>
            <br />
            <strong>Focus reports:</strong> <span data-testid="focus-reports">{focusReports.join(",") || "-"}</span>
            <br />
            <strong>Invalids:</strong> <span data-testid="invalids">{invalids}</span>{" "}
            <span data-testid="invalid-report">{invalidReport}</span>
            <br />
            <strong>Commits:</strong> <span data-testid="commits">{commits}</span>{" "}
            <span data-testid="commit-reason">{commitReason}</span>
            <br />
            <strong>Controlled Value:</strong> "{value}"
          </div>
          <div>
            <strong>Is Controlled:</strong> {value !== "" ? "Yes" : "No"}
          </div>
          <div>
            <strong>Format Options:</strong> {formatOptions ? JSON.stringify(formatOptions) : "None"}
          </div>
          <div>
            <strong>Max Fraction Digits:</strong> {maxFractionDigits ?? "None"}
          </div>
          <div>
            <strong>Value As Number:</strong> {api.valueAsNumber}
          </div>
        </div>

        <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#e8f4fd", borderRadius: "4px" }}>
          <h3>Testing Instructions</h3>
          <ul style={{ fontSize: "0.875rem", lineHeight: "1.4" }}>
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

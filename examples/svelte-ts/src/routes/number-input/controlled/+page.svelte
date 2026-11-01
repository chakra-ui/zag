<script lang="ts">
  import * as numberInput from "@zag-js/number-input"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { MinusIcon, PlusIcon } from "lucide-svelte"
  import "@styles/number-input.css"

  let value = $state("")
  let formatOptions = $state<Intl.NumberFormatOptions | undefined>(undefined)
  let maxFractionDigits = $state<number | undefined>(undefined)
  let reason = $state("-")
  let commits = $state(0)
  let commitReason = $state("-")
  let focusReports = $state<string[]>([])
  let invalids = $state(0)
  let invalidReport = $state("-")
  let focusInputOnChange = $state(true)
  let clampValueOnBlur = $state(true)

  const id = $props.id()
  const service = useMachine(numberInput.machine, () => ({
    id,
    value,
    max: 1000,
    min: 0,
    focusInputOnChange,
    clampValueOnBlur,
    formatOptions:
      maxFractionDigits !== undefined ? { ...formatOptions, maximumFractionDigits: maxFractionDigits } : formatOptions,
    onValueChange(details) {
      value = details.value
      reason = details.reason ?? "-"
    },
    onFocusChange(details) {
      focusReports = [...focusReports, details.focused ? "focus" : "blur"].slice(-4)
    },
    onValueInvalid(details) {
      invalids++
      invalidReport = `${details.reason}:${details.value}`
    },
    onValueCommit(details) {
      commits++
      commitReason = details.reason ?? "-"
    },
  }))

  const api = $derived(numberInput.connect(service, normalizeProps))
</script>

<main class="number-input">
  <h2>Controlled Number Input Testing</h2>

  <!-- Test buttons for external value changes -->
  <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap">
    <button data-testid="set-decimal" onclick={() => (value = "123.456789012345")}>
      Set High Precision (123.456789012345)
    </button>
    <button data-testid="set-simple" onclick={() => (value = "50.25")}>Set Simple (50.25)</button>
    <button data-testid="set-zero" onclick={() => (value = "0")}>Set Zero</button>
    <button data-testid="clear-value" onclick={() => (value = "")}>Clear (Uncontrolled)</button>
    <button data-testid="api-set-value" onclick={() => api.setValue(42)}>api.setValue(42)</button>
    <button data-testid="toggle-focus-on-change" onclick={() => (focusInputOnChange = !focusInputOnChange)}>
      focusInputOnChange: {String(focusInputOnChange)}
    </button>
    <button data-testid="toggle-clamp-on-blur" onclick={() => (clampValueOnBlur = !clampValueOnBlur)}>
      clampValueOnBlur: {String(clampValueOnBlur)}
    </button>
  </div>

  <!-- Format option controls -->
  <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap">
    <button
      data-testid="no-format"
      onclick={() => {
        formatOptions = undefined
        maxFractionDigits = undefined
      }}
    >
      No Format Options
    </button>
    <button
      data-testid="currency-format"
      onclick={() => {
        formatOptions = { style: "currency", currency: "USD" }
        maxFractionDigits = undefined
      }}
    >
      Currency Format
    </button>
    <button
      data-testid="precision-2"
      onclick={() => {
        formatOptions = undefined
        maxFractionDigits = 2
      }}
    >
      Max 2 Decimals
    </button>
    <button
      data-testid="precision-4"
      onclick={() => {
        formatOptions = undefined
        maxFractionDigits = 4
      }}
    >
      Max 4 Decimals
    </button>
  </div>

  <div {...api.getRootProps()}>
    <div data-testid="scrubber" {...api.getScrubberProps()}></div>
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label data-testid="label" {...api.getLabelProps()}>Controlled Number Input (0-1000):</label>
    <div {...api.getControlProps()}>
      <button data-testid="dec-button" {...api.getDecrementTriggerProps()}>
        <MinusIcon />
      </button>
      <input data-testid="input" {...api.getInputProps()} />
      <button data-testid="inc-button" {...api.getIncrementTriggerProps()}>
        <PlusIcon />
      </button>
    </div>
  </div>

  <!-- Status display -->
  <div style="margin-top: 1rem; padding: 1rem; background-color: #f5f5f5; border-radius: 4px">
    <div>
      <strong>Change Reason:</strong> <span data-testid="reason">{reason}</span>
      <br />
      <strong>Focus reports:</strong> <span data-testid="focus-reports">{focusReports.join(",") || "-"}</span>
      <br />
      <strong>Invalids:</strong> <span data-testid="invalids">{invalids}</span>
      <span data-testid="invalid-report">{invalidReport}</span>
      <br />
      <strong>Commits:</strong> <span data-testid="commits">{commits}</span>
      <span data-testid="commit-reason">{commitReason}</span>
      <br />
      <strong>Controlled Value:</strong> "{value}"
    </div>
    <div>
      <strong>Is Controlled:</strong>
      {value !== "" ? "Yes" : "No"}
    </div>
    <div>
      <strong>Format Options:</strong>
      {formatOptions ? JSON.stringify(formatOptions) : "None"}
    </div>
    <div>
      <strong>Max Fraction Digits:</strong>
      {maxFractionDigits ?? "None"}
    </div>
    <div>
      <strong>Value As Number:</strong>
      {api.valueAsNumber}
    </div>
  </div>

  <div style="margin-top: 1rem; padding: 1rem; background-color: #e8f4fd; border-radius: 4px">
    <h3>Testing Instructions</h3>
    <ul style="font-size: 0.875rem; line-height: 1.4">
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

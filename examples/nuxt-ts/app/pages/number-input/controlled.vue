<script setup lang="ts">
import * as numberInput from "@zag-js/number-input"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { MinusIcon, PlusIcon } from "lucide-vue-next"
import "@styles/number-input.css"

const value = ref("")
const formatOptions = ref<Intl.NumberFormatOptions | undefined>(undefined)
const maxFractionDigits = ref<number | undefined>(undefined)
const reason = ref("-")
const commits = ref(0)
const commitReason = ref("-")
const focusReports = ref<string[]>([])
const invalids = ref(0)
const invalidReport = ref("-")
const focusInputOnChange = ref(true)
const clampValueOnBlur = ref(true)

const id = useId()

const service = useMachine(
  numberInput.machine,
  computed<numberInput.Props>(() => ({
    id,
    value: value.value,
    max: 1000,
    min: 0,
    focusInputOnChange: focusInputOnChange.value,
    clampValueOnBlur: clampValueOnBlur.value,
    formatOptions:
      maxFractionDigits.value !== undefined
        ? { ...formatOptions.value, maximumFractionDigits: maxFractionDigits.value }
        : formatOptions.value,
    onValueChange(details) {
      value.value = details.value
      reason.value = details.reason ?? "-"
    },
    onFocusChange(details) {
      focusReports.value = [...focusReports.value, details.focused ? "focus" : "blur"].slice(-4)
    },
    onValueInvalid(details) {
      invalids.value++
      invalidReport.value = `${details.reason}:${details.value}`
    },
    onValueCommit(details) {
      commits.value++
      commitReason.value = details.reason ?? "-"
    },
  })),
)

const api = computed(() => numberInput.connect(service, normalizeProps))

const setFormat = (options: Intl.NumberFormatOptions | undefined, digits: number | undefined) => {
  formatOptions.value = options
  maxFractionDigits.value = digits
}
</script>

<template>
  <main class="number-input">
    <h2>Controlled Number Input Testing</h2>

    <!-- Test buttons for external value changes -->
    <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap">
      <button data-testid="set-decimal" @click="value = '123.456789012345'">
        Set High Precision (123.456789012345)
      </button>
      <button data-testid="set-simple" @click="value = '50.25'">Set Simple (50.25)</button>
      <button data-testid="set-zero" @click="value = '0'">Set Zero</button>
      <button data-testid="clear-value" @click="value = ''">Clear (Uncontrolled)</button>
      <button data-testid="api-set-value" @click="api.setValue(42)">api.setValue(42)</button>
      <button data-testid="toggle-focus-on-change" @click="focusInputOnChange = !focusInputOnChange">
        focusInputOnChange: {{ String(focusInputOnChange) }}
      </button>
      <button data-testid="toggle-clamp-on-blur" @click="clampValueOnBlur = !clampValueOnBlur">
        clampValueOnBlur: {{ String(clampValueOnBlur) }}
      </button>
    </div>

    <!-- Format option controls -->
    <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap">
      <button data-testid="no-format" @click="setFormat(undefined, undefined)">No Format Options</button>
      <button data-testid="currency-format" @click="setFormat({ style: 'currency', currency: 'USD' }, undefined)">
        Currency Format
      </button>
      <button data-testid="precision-2" @click="setFormat(undefined, 2)">Max 2 Decimals</button>
      <button data-testid="precision-4" @click="setFormat(undefined, 4)">Max 4 Decimals</button>
    </div>

    <div v-bind="api.getRootProps()">
      <div data-testid="scrubber" v-bind="api.getScrubberProps()" />
      <label data-testid="label" v-bind="api.getLabelProps()">Controlled Number Input (0-1000):</label>
      <div v-bind="api.getControlProps()">
        <button data-testid="dec-button" v-bind="api.getDecrementTriggerProps()">
          <MinusIcon />
        </button>
        <input data-testid="input" v-bind="api.getInputProps()" />
        <button data-testid="inc-button" v-bind="api.getIncrementTriggerProps()">
          <PlusIcon />
        </button>
      </div>
    </div>

    <!-- Status display -->
    <div style="margin-top: 1rem; padding: 1rem; background-color: #f5f5f5; border-radius: 4px">
      <div>
        <strong>Change Reason:</strong> <span data-testid="reason">{{ reason }}</span>
        <br />
        <strong>Focus reports:</strong> <span data-testid="focus-reports">{{ focusReports.join(",") || "-" }}</span>
        <br />
        <strong>Invalids:</strong> <span data-testid="invalids">{{ invalids }}</span> {{ " "
        }}<span data-testid="invalid-report">{{ invalidReport }}</span>
        <br />
        <strong>Commits:</strong> <span data-testid="commits">{{ commits }}</span> {{ " "
        }}<span data-testid="commit-reason">{{ commitReason }}</span>
        <br />
        <strong>Controlled Value:</strong> "{{ value }}"
      </div>
      <div><strong>Is Controlled:</strong> {{ value !== "" ? "Yes" : "No" }}</div>
      <div><strong>Format Options:</strong> {{ formatOptions ? JSON.stringify(formatOptions) : "None" }}</div>
      <div><strong>Max Fraction Digits:</strong> {{ maxFractionDigits ?? "None" }}</div>
      <div><strong>Value As Number:</strong> {{ api.valueAsNumber }}</div>
    </div>

    <div style="margin-top: 1rem; padding: 1rem; background-color: #e8f4fd; border-radius: 4px">
      <h3>Testing Instructions</h3>
      <ul style="font-size: 0.875rem; line-height: 1.4">
        <li><strong>Controlled Mode:</strong> When you set a value using buttons above, input is controlled</li>
        <li><strong>Uncontrolled Mode:</strong> When you clear the value, input becomes uncontrolled</li>
        <li><strong>Precision Test:</strong> Set high precision value, then type to see how precision is preserved</li>
        <li><strong>Format Test:</strong> Apply different formats to see controlled vs uncontrolled behavior</li>
        <li><strong>External Changes:</strong> Use buttons to change value externally while typing</li>
      </ul>
    </div>
  </main>
</template>

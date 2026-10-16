<script lang="ts">
  import * as numberInput from "@zag-js/number-input"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  interface Props {
    label: string
    value: number
    min: number
    max: number
    onChange: (value: number) => void
  }

  const props: Props = $props()

  let draft = $state<string | null>(null)

  const id = $props.id()
  const service = useMachine(numberInput.machine, () => ({
    id,
    value: draft ?? String(props.value),
    min: props.min,
    max: props.max,
    formatOptions: { style: "currency" as const, currency: "USD", maximumFractionDigits: 0 },
    onValueChange(details: numberInput.ValueChangeDetails) {
      draft = details.value
    },
    onValueCommit(details: numberInput.ValueChangeDetails) {
      if (!Number.isNaN(details.valueAsNumber)) props.onChange(details.valueAsNumber)
      draft = null
    },
  }))

  const api = $derived(numberInput.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  <label {...api.getLabelProps()}>{props.label}</label>
  <input {...api.getInputProps()} />
</div>

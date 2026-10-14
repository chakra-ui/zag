<script lang="ts">
  import * as numberInput from "@zag-js/number-input"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"

  interface Props {
    value: string
    onChange: (value: string) => void
    min: number
    max: number
  }

  const props: Props = $props()

  const id = $props.id()
  const service = useMachine(numberInput.machine, () => ({
    id,
    value: props.value,
    min: props.min,
    max: props.max,
    onValueChange(details: numberInput.ValueChangeDetails) {
      props.onChange(details.value)
    },
  }))

  const api = $derived(numberInput.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  <div {...mergeProps(api.getControlProps(), { style: { display: "flex" } })}>
    <span style="font-size: 12px; padding-inline: 4px; padding-block: 2.5px; border: 1px inset black">USD</span>
    <input {...api.getInputProps()} />
  </div>
</div>

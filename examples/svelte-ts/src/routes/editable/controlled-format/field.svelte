<script lang="ts">
  import * as editable from "@zag-js/editable"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  interface Props {
    name: string
    format: (value: string) => string
  }

  const { name, format }: Props = $props()

  let value = $state("abc")

  const id = $props.id()
  const service = useMachine(editable.machine, () => ({
    id,
    value,
    onValueChange(details) {
      value = format(details.value)
    },
  }))

  const api = $derived(editable.connect(service, normalizeProps))
</script>

<div data-testid={name} {...api.getRootProps()}>
  <label {...api.getLabelProps()}>{name}</label>
  <div {...api.getAreaProps()}>
    <input data-testid="input" {...api.getInputProps()} />
    <span data-testid="preview" {...api.getPreviewProps()}>{api.valueText}</span>
  </div>
  <output data-testid="value">{value}</output>
</div>

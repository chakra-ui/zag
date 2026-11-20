<script lang="ts">
  import * as editable from "@zag-js/editable"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { untrack } from "svelte"

  interface Props {
    row: number
    defaultName: string
    onLog: (entry: string) => void
  }

  const { row, defaultName, onLog }: Props = $props()

  let name = untrack(() => defaultName)

  const id = $props.id()
  const service = useMachine(editable.machine, (): editable.Props => ({
    id,
    defaultValue: defaultName,
    activationMode: "dblclick",
    translations: { edit: `Rename row ${row}` },
    onValueCommit: (details) => {
      if (details.value !== name) onLog(`Renamed ${name} to ${details.value}`)
      name = details.value
    },
    onValueRevert: (details) => onLog(`Kept ${details.value}`),
  }))
  const api = $derived(editable.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  <!-- svelte-ignore a11y_label_has_associated_control -->
  <label class="visually-hidden" {...api.getLabelProps()}>Name, row {row}</label>
  <div {...api.getAreaProps()}>
    <input {...api.getInputProps()} />
    <span {...api.getPreviewProps()}>{api.valueText}</span>
  </div>
</div>

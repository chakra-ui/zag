<script lang="ts">
  import * as progress from "@zag-js/progress"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  interface Props {
    label: string
    value: number
  }

  const props: Props = $props()

  const id = $props.id()
  const service = useMachine(progress.machine, () => ({
    id,
    orientation: "vertical" as const,
    defaultValue: props.value,
  }))

  const api = $derived(progress.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  <span {...api.getValueTextProps()}>{api.valueAsString}</span>
  <div {...api.getTrackProps()}>
    <div {...api.getRangeProps()}></div>
  </div>
  <span {...api.getLabelProps()}>{props.label}</span>
</div>

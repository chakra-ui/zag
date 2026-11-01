<script lang="ts">
  import * as zagSwitch from "@zag-js/switch"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const { label, testId }: { label: string; testId: string } = $props()

  const id = $props.id()
  const service = useMachine(zagSwitch.machine, { id })
  const api = $derived(zagSwitch.connect(service, normalizeProps))
</script>

<label {...api.getRootProps()} data-testid={testId} style="display: flex; gap: 8px; align-items: center">
  <input {...api.getHiddenInputProps()} />
  <span {...api.getControlProps()} style="width: 30px; height: 18px; background: #bbb; border-radius: 9px">
    <span {...api.getThumbProps()}></span>
  </span>
  <span {...api.getLabelProps()}>{label}</span>
</label>

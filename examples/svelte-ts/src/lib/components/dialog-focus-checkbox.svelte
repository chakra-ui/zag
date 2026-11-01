<script lang="ts">
  import * as checkbox from "@zag-js/checkbox"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const { label, testId }: { label: string; testId: string } = $props()

  const id = $props.id()
  const service = useMachine(checkbox.machine, { id })
  const api = $derived(checkbox.connect(service, normalizeProps))
</script>

<label {...api.getRootProps()} data-testid={testId} style="display: flex; gap: 8px; align-items: center">
  <div {...api.getControlProps()} style="width: 18px; height: 18px; border: 2px solid #888"></div>
  <span {...api.getLabelProps()}>{label}</span>
  <input {...api.getHiddenInputProps()} />
</label>

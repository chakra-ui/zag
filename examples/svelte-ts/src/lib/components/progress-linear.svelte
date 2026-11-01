<script lang="ts">
  import * as progress from "@zag-js/progress"
  import { normalizeProps, useMachine } from "@zag-js/svelte"

  const id = $props.id()
  const service = useMachine(progress.machine, { id, defaultValue: null })
  const api = $derived(progress.connect(service, normalizeProps))
</script>

<div {...api.getRootProps()}>
  <span {...api.getLabelProps()}>Loading files</span>
  <div {...api.getTrackProps()}>
    <div {...api.getRangeProps()}></div>
  </div>
</div>

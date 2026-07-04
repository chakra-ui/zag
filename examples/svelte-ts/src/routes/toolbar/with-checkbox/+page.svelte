<script lang="ts">
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import { mergeProps, normalizeProps, useMachine } from "@zag-js/svelte"
  import * as checkbox from "@zag-js/checkbox"
  import * as toolbar from "@zag-js/toolbar"
  import "@styles/toolbar.css"
  import "@styles/checkbox.css"

  const id = $props.id()
  const service = useMachine(toolbar.machine, { id })
  const api = $derived(toolbar.connect(service, normalizeProps))

  const checkboxService = useMachine(checkbox.machine, () => ({
    id: `${id}-track-changes`,
    ids: { hiddenInput: api.getItemId("track-changes") },
    disabled: api.disabled,
  }))
  const checkboxApi = $derived(checkbox.connect(checkboxService, normalizeProps))
</script>

<main class="toolbar">
  <div {...api.getRootProps()}>
    <button {...api.getItemProps({ value: "cut" })}>Cut</button>
    <button {...api.getItemProps({ value: "copy" })}>Copy</button>
    <div {...api.getSeparatorProps()}></div>
    <label {...checkboxApi.getRootProps()} class="toolbar-item">
      <div {...checkboxApi.getControlProps()}></div>
      <input {...mergeProps(checkboxApi.getHiddenInputProps(), api.getItemProps({ value: "track-changes" }))} type="checkbox" />
      <span {...checkboxApi.getLabelProps()}>Track changes</span>
    </label>
  </div>
</main>

<Toolbar>
  <StateVisualizer state={service} />
</Toolbar>


<script lang="ts">
  import * as editable from "@zag-js/editable"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { editableControls } from "@zag-js/shared"
  import { useControls } from "$lib/use-controls.svelte"

  const controls = useControls(editableControls)

  const id = $props.id()
  const service = useMachine(editable.machine, {
    id,
    defaultValue: "Hello World",
  })

  const api = $derived(editable.connect(service, normalizeProps))
</script>

<main class="editable">
  <div {...api.getRootProps()}>
    <div {...api.getAreaProps()}>
      <input data-testid="input" {...api.getInputProps()} />
      <span data-testid="preview" {...api.getPreviewProps()}>{api.valueText}</span>
    </div>
    <div {...api.getControlProps()}>
      {#if !api.editing}
        <button data-testid="edit-button" {...api.getEditTriggerProps()}> Edit </button>
      {/if}
      {#if api.editing}
        <button data-testid="save-button" {...api.getSubmitTriggerProps()}> Save </button>
        <button data-testid="cancel-button" {...api.getCancelTriggerProps()}> Cancel </button>
      {/if}
    </div>
  </div>
</main>

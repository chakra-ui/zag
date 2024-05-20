<script lang="ts">
  import * as editable from "@zag-js/editable"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { editableControls } from "@zag-js/shared"
  import { useControls } from "$lib/use-controls.svelte"

  const controls = useControls(editableControls)

  const [snapshot, send] = useMachine(editable.machine({ id: "1" }), {
    context: controls.context,
  })

  const api = $derived(editable.connect(snapshot, send, normalizeProps))
</script>

<main class="editable">
  <div {...api.rootProps}>
    <div {...api.areaProps}>
      <input data-testid="input" {...api.inputProps} />
      <span data-testid="preview" {...api.previewProps}>{api.valueText}</span>
    </div>
    <div {...api.controlProps}>
      {#if !api.editing}
        <button data-testid="edit-button" {...api.editTriggerProps}> Edit </button>
      {/if}
      {#if api.editing}
        <button data-testid="save-button" {...api.submitTriggerProps}> Save </button>
        <button data-testid="cancel-button" {...api.cancelTriggerProps}> Cancel </button>
      {/if}
    </div>
  </div>
</main>

<script lang="ts">
  import styles from "../../../../../../shared/src/css/editable.module.css"
  import * as editable from "@zag-js/editable"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { editableControls } from "@zag-js/shared"
  import { useControls } from "$lib/use-controls.svelte"

  const controls = useControls(editableControls)

  const id = $props.id()
  const service = useMachine(
    editable.machine,
    controls.mergeProps<editable.Props>({
      id,
      defaultValue: "Hello World",
    }),
  )

  const api = $derived(editable.connect(service, normalizeProps))
</script>

<main class="editable">
  <div {...api.getRootProps()}>
    <div {...api.getAreaProps()} class={styles.Area}>
      <input data-testid="input" {...api.getInputProps()} class={styles.Input} />
      <span data-testid="preview" {...api.getPreviewProps()} class={styles.Preview}>{api.valueText}</span>
    </div>
    <div {...api.getControlProps()} class={styles.Control}>
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

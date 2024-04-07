<script lang="ts">
  import * as fileUpload from "@zag-js/file-upload"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { fileUploadControls } from "@zag-js/shared"
  import { useControls } from "$lib/use-controls.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"

  const controls = useControls(fileUploadControls)

  const [state, send] = useMachine(fileUpload.machine({ id: "1" }), {
    context: controls.context,
  })

  const api = $derived(fileUpload.connect(state, send, normalizeProps))
</script>

<main class="file-upload">
  <div {...api.rootProps}>
    <div {...api.dropzoneProps}>
      <input {...api.hiddenInputProps} />
      Drag your files here
    </div>

    <button {...api.triggerProps}>Choose Files...</button>

    <ul {...api.itemGroupProps}>
      {#each api.acceptedFiles as file}
        <li class="file" {...api.getItemProps({ file })}>
          <div>
            <b>{file.name}</b>
          </div>
          <div {...api.getItemSizeTextProps({ file })}>{api.getFileSize(file)}</div>
          <div>{file.type}</div>
          <button {...api.getItemDeleteTriggerProps({ file })}>X</button>
        </li>
      {/each}
    </ul>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer {state} />
</Toolbar>

<script lang="ts">
  import * as fileUpload from "@zag-js/file-upload"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { fileUploadControls } from "@zag-js/shared"
  import { useControls } from "$lib/use-controls.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"
  import "@styles/file-upload.css"

  const controls = useControls(fileUploadControls)

  const id = $props.id()
  const service = useMachine(fileUpload.machine, { id, maxFiles: 2 })

  const api = $derived(fileUpload.connect(service, normalizeProps))
</script>

<main class="file-upload">
  <div {...api.getRootProps()}>
    <input data-testid="input" {...api.getHiddenInputProps()} />
    <div {...api.getDropzoneProps()}>Drag your files here</div>

    <button {...api.getTriggerProps()}>Choose Files...</button>

    <ul {...api.getItemGroupProps()}>
      <li>Accepted files</li>
      {#each api.acceptedFiles as file (file.name)}
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

    <ul {...api.getItemGroupProps({ type: "rejected" })}>
      <li>Rejected files</li>
      {#each api.rejectedFiles as { file, errors } (file.name)}
        <li class="file" {...api.getItemProps({ file, type: "rejected" })}>
          <div>
            <b>{file.name}</b>
            {#each errors as error (error)}
              <span>{error}</span>
            {/each}
          </div>
          <div {...api.getItemSizeTextProps({ file, type: "rejected" })}>{api.getFileSize(file)}</div>
          <div>{file.type}</div>
          <button {...api.getItemDeleteTriggerProps({ file, type: "rejected" })}>X</button>
        </li>
      {/each}
    </ul>
  </div>
</main>

<Toolbar {controls}>
  <StateVisualizer state={service} />
</Toolbar>

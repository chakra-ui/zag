<script lang="ts">
  import * as fileUpload from "@zag-js/file-upload"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { fileUploadControls } from "@zag-js/shared"
  import { useControls } from "$lib/use-controls.svelte"
  import Toolbar from "$lib/components/toolbar.svelte"
  import StateVisualizer from "$lib/components/state-visualizer.svelte"

  const controls = useControls(fileUploadControls)

  const id = $props.id()
  const service = useMachine(fileUpload.machine, { id, accept: "image/*" })

  const api = $derived(fileUpload.connect(service, normalizeProps))
</script>

<main class="file-upload">
  <div {...api.getRootProps()}>
    <div {...api.getDropzoneProps()}>
      <input {...api.getHiddenInputProps()} />
      Drag your files here
    </div>

    <button {...api.getTriggerProps()}>Choose Files...</button>

    <ul {...api.getItemGroupProps()}>
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
  <StateVisualizer state={service} />
</Toolbar>

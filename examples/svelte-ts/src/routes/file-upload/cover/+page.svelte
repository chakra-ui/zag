<script lang="ts">
  import * as fileUpload from "@zag-js/file-upload"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/file-upload.css"

  const id = $props.id()
  const service = useMachine(fileUpload.machine, { id })
  const api = $derived(fileUpload.connect(service, normalizeProps))
</script>

<main class="file-upload">
  <div {...api.getRootProps()}>
    <div {...api.getDropzoneProps({ disableClick: true })} data-cover="">
      {#if api.dragging}
        <p>Drop any files here to upload</p>
      {/if}
    </div>
    <div style="position: relative">
      <input {...api.getHiddenInputProps()} />
      <button {...api.getTriggerProps()}>Choose Files...</button>

      <button>Normal Button</button>

      <ul {...api.getItemGroupProps()}>
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
    </div>
  </div>
</main>

<script lang="ts">
  import * as fileUpload from "@zag-js/file-upload"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { XIcon } from "lucide-svelte"
  import "@styles/file-upload.css"

  // Plain form handling: validate on submit, then re-validate as files change
  const id = $props.id()
  const service = useMachine(fileUpload.machine, { id })
  const api = $derived(fileUpload.connect(service, normalizeProps))

  let submitted = $state(false)
  const error = $derived(submitted && !api.acceptedFiles.length ? "This is required" : undefined)

  function onSubmit(event: SubmitEvent) {
    event.preventDefault()
    submitted = true
    if (!api.acceptedFiles.length) return
    console.log({ file: api.acceptedFiles })
  }
</script>

<main>
  <form style="width: 100%" onsubmit={onSubmit}>
    <div {...api.getRootProps()}>
      <input {...api.getHiddenInputProps()} name="file" />
      <div {...api.getDropzoneProps()}>
        <span>Drag your files here</span>
        <button {...api.getTriggerProps()}>Open Dialog</button>
      </div>

      <div>
        {#each api.acceptedFiles as file (file.name)}
          <div {...api.getItemProps({ file })}>
            <div>
              {file.name}
              {api.getFileSize(file)}
            </div>
            <button {...api.getItemDeleteTriggerProps({ file })}>
              <XIcon />
            </button>
          </div>
        {/each}
      </div>

      <button type="submit">Submit</button>

      {error ?? ""}
    </div>
  </form>
</main>

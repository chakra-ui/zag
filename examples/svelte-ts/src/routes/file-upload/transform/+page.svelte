<script lang="ts">
  import * as fileUpload from "@zag-js/file-upload"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/file-upload.css"

  // Re-encode via canvas, lowering quality until the image fits `maxKb`
  async function compressImage(file: File, maxKb: number): Promise<Blob> {
    const bitmap = await createImageBitmap(file)
    const canvas = document.createElement("canvas")
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0)
    bitmap.close()
    let blob: Blob = file
    for (let quality = 0.92; quality > 0.05; quality -= 0.1) {
      blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", quality))
      if (blob.size <= maxKb * 1024) break
    }
    return blob
  }

  const id = $props.id()
  const service = useMachine(fileUpload.machine, {
    id,
    accept: ["image/jpeg", "image/png"],
    transformFiles: (files) =>
      Promise.all(
        files.map(async (file) => {
          const blob = await compressImage(file, 200)
          return new File([blob], file.name, { type: blob.type })
        }),
      ),
  })

  const api = $derived(fileUpload.connect(service, normalizeProps))
</script>

<main class="file-upload">
  <div {...api.getRootProps()}>
    <input data-testid="input" {...api.getHiddenInputProps()} />
    <div {...api.getDropzoneProps()}>Drag your files here</div>

    <button {...api.getTriggerProps()}>Choose Files...</button>

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
</main>

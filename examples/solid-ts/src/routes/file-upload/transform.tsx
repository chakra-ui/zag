import * as fileUpload from "@zag-js/file-upload"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, Index } from "solid-js"
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

export default function Page() {
  const service = useMachine(fileUpload.machine, {
    id: createUniqueId(),
    accept: ["image/jpeg", "image/png"],
    transformFiles: async (files) => {
      return Promise.all(
        files.map(async (file) => {
          const blob = await compressImage(file, 200)
          return new File([blob], file.name, { type: blob.type })
        }),
      )
    },
  })

  const api = createMemo(() => fileUpload.connect(service, normalizeProps))

  return (
    <main class="file-upload">
      <div {...api().getRootProps()}>
        <input data-testid="input" {...api().getHiddenInputProps()} />
        <div {...api().getDropzoneProps()}>Drag your files here</div>

        <button {...api().getTriggerProps()}>Choose Files...</button>

        <ul {...api().getItemGroupProps()}>
          <Index each={api().acceptedFiles}>
            {(file) => (
              <li class="file" {...api().getItemProps({ file: file() })}>
                <div>
                  <b>{file().name}</b>
                </div>
                <div {...api().getItemSizeTextProps({ file: file() })}>{api().getFileSize(file())}</div>
                <div>{file().type}</div>
                <button {...api().getItemDeleteTriggerProps({ file: file() })}>X</button>
              </li>
            )}
          </Index>
        </ul>
      </div>
    </main>
  )
}

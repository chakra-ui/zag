<script setup lang="ts">
import * as fileUpload from "@zag-js/file-upload"
import { normalizeProps, useMachine } from "@zag-js/vue"
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

const service = useMachine(fileUpload.machine, {
  id: useId(),
  accept: ["image/jpeg", "image/png"],
  transformFiles: (files) =>
    Promise.all(
      files.map(async (file) => {
        const blob = await compressImage(file, 200)
        return new File([blob], file.name, { type: blob.type })
      }),
    ),
})

const api = computed(() => fileUpload.connect(service, normalizeProps))
</script>

<template>
  <main class="file-upload">
    <div v-bind="api.getRootProps()">
      <input data-testid="input" v-bind="api.getHiddenInputProps()" />
      <div v-bind="api.getDropzoneProps()">Drag your files here</div>

      <button v-bind="api.getTriggerProps()">Choose Files...</button>

      <ul v-bind="api.getItemGroupProps()">
        <li v-for="file in api.acceptedFiles" :key="file.name" class="file" v-bind="api.getItemProps({ file })">
          <div>
            <b>{{ file.name }}</b>
          </div>
          <div v-bind="api.getItemSizeTextProps({ file })">{{ api.getFileSize(file) }}</div>
          <div>{{ file.type }}</div>
          <button v-bind="api.getItemDeleteTriggerProps({ file })">X</button>
        </li>
      </ul>
    </div>
  </main>
</template>

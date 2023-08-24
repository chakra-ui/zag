<script setup lang="ts">
import * as fileUpload from "@zag-js/file-upload"
import { fileUploadControls, formatFileSize } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(fileUploadControls)

const [state, send] = useMachine(fileUpload.machine({ id: "1" }), {
  context: controls.context,
})

const api = computed(() => fileUpload.connect(state.value, send, normalizeProps))
</script>

<template>
  <main class="file-upload">
    <div v-bind="api.rootProps">
      <div v-bind="api.dropzoneProps">
        <input v-bind="api.hiddenInputProps" />
        Drag your files here
      </div>

      <button v-bind="api.triggerProps">Choose Files...</button>

      <ul>
        <li v-for="file in api.files" :key="file.name" class="file">
          <div>
            <b>{file.name}</b>
          </div>
          <div>{formatFileSize(file.size)}</div>
          <div>{file.type}</div>
          <button v-bind="api.getDeleteTriggerProps({ file })">X</button>
        </li>
      </ul>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :config="controls.config" :state="controls.context" />
    </template>
  </Toolbar>
</template>

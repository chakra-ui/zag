<script setup lang="ts">
import * as fileUpload from "@zag-js/file-upload"
import { fileUploadControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(fileUploadControls)

const service = useMachine(fileUpload.machine, {
  id: useId(),
})

const api = computed(() => fileUpload.connect(service, normalizeProps))
</script>

<template>
  <main class="file-upload">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getDropzoneProps()">
        <input v-bind="api.getHiddenInputProps()" />
        Drag your files here
      </div>

      <button v-bind="api.getTriggerProps()">Choose Files...</button>

      <ul v-bind="api.getItemGroupProps()">
        <li v-for="file in api.acceptedFiles" :key="file.name" class="file" v-bind="api.getItemProps({ file })">
          <div v-bind="api.getItemNameProps({ file })">
            <b>{file.name}</b>
          </div>
          <div>{{ api.getFileSize(file) }}</div>
          <div>{{ file.type }}</div>
          <button v-bind="api.getItemDeleteTriggerProps({ file })">X</button>
        </li>
      </ul>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

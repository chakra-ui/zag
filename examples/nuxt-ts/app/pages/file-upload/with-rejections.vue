<script setup lang="ts">
import * as fileUpload from "@zag-js/file-upload"
import { fileUploadControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/file-upload.css"

const controls = useControls(fileUploadControls)

const service = useMachine(fileUpload.machine, {
  id: useId(),
  maxFiles: 2,
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
        <li>Accepted files</li>
        <li v-for="file in api.acceptedFiles" :key="file.name" class="file" v-bind="api.getItemProps({ file })">
          <div>
            <b>{{ file.name }}</b>
          </div>
          <div v-bind="api.getItemSizeTextProps({ file })">{{ api.getFileSize(file) }}</div>
          <div>{{ file.type }}</div>
          <button v-bind="api.getItemDeleteTriggerProps({ file })">X</button>
        </li>
      </ul>

      <ul v-bind="api.getItemGroupProps({ type: 'rejected' })">
        <li>Rejected files</li>
        <li
          v-for="{ file, errors } in api.rejectedFiles"
          :key="file.name"
          class="file"
          v-bind="api.getItemProps({ file, type: 'rejected' })"
        >
          <div>
            <b>{{ file.name }}</b>
            <span v-for="error in errors" :key="error">{{ error }}</span>
          </div>
          <div v-bind="api.getItemSizeTextProps({ file, type: 'rejected' })">{{ api.getFileSize(file) }}</div>
          <div>{{ file.type }}</div>
          <button v-bind="api.getItemDeleteTriggerProps({ file, type: 'rejected' })">X</button>
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

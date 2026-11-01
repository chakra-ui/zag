<script setup lang="ts">
import * as fileUpload from "@zag-js/file-upload"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/file-upload.css"

const service = useMachine(fileUpload.machine, { id: useId() })
const api = computed(() => fileUpload.connect(service, normalizeProps))
</script>

<template>
  <main class="file-upload">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getDropzoneProps({ disableClick: true })" data-cover="">
        <p v-if="api.dragging">Drop any files here to upload</p>
      </div>
      <div style="position: relative">
        <input v-bind="api.getHiddenInputProps()" />
        <button v-bind="api.getTriggerProps()">Choose Files...</button>

        <button>Normal Button</button>

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
    </div>
  </main>
</template>

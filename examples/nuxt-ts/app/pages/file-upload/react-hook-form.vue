<script setup lang="ts">
import * as fileUpload from "@zag-js/file-upload"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/file-upload.css"

// Plain form handling: validate on submit, then re-validate as files change
const service = useMachine(fileUpload.machine, { id: useId() })
const api = computed(() => fileUpload.connect(service, normalizeProps))

const submitted = ref(false)
const error = computed(() => (submitted.value && !api.value.acceptedFiles.length ? "This is required" : undefined))

function onSubmit() {
  submitted.value = true
  if (error.value) return
  console.log({ file: api.value.acceptedFiles })
}
</script>

<template>
  <main>
    <form style="width: 100%" @submit.prevent="onSubmit">
      <div v-bind="api.getRootProps()">
        <input v-bind="api.getHiddenInputProps()" name="file" />
        <div v-bind="api.getDropzoneProps()">
          <span>Drag your files here</span>
          <button v-bind="api.getTriggerProps()">Open Dialog</button>
        </div>

        <div>
          <div v-for="file in api.acceptedFiles" :key="file.name" v-bind="api.getItemProps({ file })">
            <div>{{ file.name }} {{ api.getFileSize(file) }}</div>
            <button v-bind="api.getItemDeleteTriggerProps({ file })"><XIcon /></button>
          </div>
        </div>

        <button type="submit">Submit</button>

        {{ error }}
      </div>
    </form>
  </main>
</template>

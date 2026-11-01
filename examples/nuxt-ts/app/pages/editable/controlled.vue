<script setup lang="ts">
import * as editable from "@zag-js/editable"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/editable.css"

const id = useId()
const edit = ref(false)

const service = useMachine(
  editable.machine,
  computed<editable.Props>(() => ({
    id,
    value: "Hello World",
    edit: edit.value,
    onEditChange(details) {
      edit.value = details.edit
    },
  })),
)

const api = computed(() => editable.connect(service, normalizeProps))
</script>

<template>
  <main class="editable">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getAreaProps()">
        <input data-testid="input" v-bind="api.getInputProps()" />
        <span data-testid="preview" v-bind="api.getPreviewProps()" />
      </div>
      <div v-bind="api.getControlProps()">
        <button v-if="!api.editing" data-testid="edit-button" v-bind="api.getEditTriggerProps()">Edit</button>
        <template v-else>
          <button data-testid="save-button" v-bind="api.getSubmitTriggerProps()">Save</button>
          <button data-testid="cancel-button" v-bind="api.getCancelTriggerProps()">Cancel</button>
        </template>
      </div>
    </div>
  </main>
</template>

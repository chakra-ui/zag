<script setup lang="ts">
import * as editable from "@zag-js/editable"
import { editableControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(editableControls)

const [state, send] = useMachine(editable.machine({ id: "editable", value: "Hello World" }), {
  context: controls.context,
})

const api = computed(() => editable.connect(state.value, send, normalizeProps))
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

        <Fragment v-if="api.editing">
          <button data-testid="save-button" v-bind="api.getSubmitTriggerProps()">Save</button>
          <button data-testid="cancel-button" v-bind="api.getCancelTriggerProps()">Cancel</button>
        </Fragment>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

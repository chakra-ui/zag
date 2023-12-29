<script setup lang="ts">
import * as editable from "@zag-js/editable"
import { editableControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(editableControls)

const [state, send] = useMachine(editable.machine({ id: "editable" }), {
  context: controls.context,
})

const api = computed(() => editable.connect(state.value, send, normalizeProps))
</script>

<template>
  <main class="editable">
    <div v-bind="api.rootProps">
      <div v-bind="api.areaProps">
        <input data-testid="input" v-bind="api.inputProps" />
        <span data-testid="preview" v-bind="api.previewProps" />
      </div>
      <div v-bind="api.controlProps">
        <button v-if="!api.isEditing" data-testid="edit-button" v-bind="api.editTriggerProps">Edit</button>

        <Fragment v-if="api.isEditing">
          <button data-testid="save-button" v-bind="api.submitTriggerProps">Save</button>
          <button data-testid="cancel-button" v-bind="api.cancelTriggerProps">Cancel</button>
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

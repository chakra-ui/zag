<script setup lang="ts">
import styles from "../../../../../shared/src/css/editable.module.css"
import * as editable from "@zag-js/editable"
import { editableControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(editableControls)

const service = useMachine(
  editable.machine,
  controls.mergeProps<editable.Props>({
    id: useId(),
    defaultValue: "Hello World",
  }),
)

const api = computed(() => editable.connect(service, normalizeProps))
</script>

<template>
  <main class="editable">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getAreaProps()" :class="styles.Area">
        <input data-testid="input" v-bind="api.getInputProps()" :class="styles.Input" />
        <span data-testid="preview" v-bind="api.getPreviewProps()" :class="styles.Preview" />
      </div>
      <div v-bind="api.getControlProps()" :class="styles.Control">
        <button v-if="!api.editing" data-testid="edit-button" v-bind="api.getEditTriggerProps()">Edit</button>

        <Fragment v-if="api.editing">
          <button data-testid="save-button" v-bind="api.getSubmitTriggerProps()">Save</button>
          <button data-testid="cancel-button" v-bind="api.getCancelTriggerProps()">Cancel</button>
        </Fragment>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

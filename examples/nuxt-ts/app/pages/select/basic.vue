<script setup lang="tsx">
import styles from "../../../../../shared/src/css/select.module.css"
import * as select from "@zag-js/select"
import { selectControls, selectData } from "@zag-js/shared"
import serialize from "form-serialize"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(selectControls)

const service = useMachine(
  select.machine,
  controls.mergeProps<select.Props>({
    collection: select.collection({ items: selectData }),
    id: useId(),
  }),
)

const api = computed(() => select.connect(service, normalizeProps))
</script>

<template>
  <main class="select">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getControlProps()" :class="styles.Control">
        <label v-bind="api.getLabelProps()" :class="styles.Label">Label</label>
        <button v-bind="api.getTriggerProps()" :class="styles.Trigger">
          <span>{{ api.valueAsString || "Select option" }}</span>
          <span v-bind="api.getIndicatorProps()">▼</span>
        </button>
      </div>
      <form
        @input="
          (e) => {
            const form = e.currentTarget as HTMLFormElement
            const formData = serialize(form, { hash: true })
            console.log(formData)
          }
        "
      >
        <select v-bind="api.getHiddenSelectProps()">
          <option v-for="option in selectData" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </form>
      <Teleport to="#teleports">
        <div v-bind="api.getPositionerProps()" :class="styles.Positioner">
          <ul v-bind="api.getContentProps()" :class="styles.Content">
            <li v-for="item in selectData" :key="item.value" v-bind="api.getItemProps({ item })" :class="styles.Item">
              <span v-bind="api.getItemTextProps({ item })" :class="styles.ItemText">{{ item.label }}</span>
              <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
            </li>
          </ul>
        </div>
      </Teleport>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :omit="['collection']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

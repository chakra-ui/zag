<script setup lang="tsx">
import * as select from "@zag-js/select"
import { selectControls, selectData } from "@zag-js/shared"
import serialize from "form-serialize"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(selectControls)

const service = useMachine(select.machine, {
  collection: select.collection({ items: selectData }),
  id: useId(),
})

const api = computed(() => select.connect(service, normalizeProps))
</script>

<template>
  <main class="select">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getControlProps()">
        <label v-bind="api.getLabelProps()">Label</label>
        <button v-bind="api.getTriggerProps()">
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
      <Teleport to="body">
        <div v-bind="api.getPositionerProps()">
          <ul v-bind="api.getContentProps()">
            <li v-for="item in selectData" :key="item.value" v-bind="api.getItemProps({ item })">
              <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
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

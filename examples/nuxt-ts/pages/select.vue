<script setup lang="tsx">
import * as select from "@zag-js/select"
import { selectControls, selectData } from "@zag-js/shared"
import serialize from "form-serialize"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(selectControls)

const [state, send] = useMachine(
  select.machine({
    collection: select.collection({ items: selectData }),
    id: "1",
  }),
  {
    context: controls.context,
  },
)

const api = computed(() => select.connect(state.value, send, normalizeProps))
</script>

<template>
  <main class="select">
    <div v-bind="api.rootProps">
      <div v-bind="api.controlProps">
        <label v-bind="api.labelProps">Label</label>
        <button v-bind="api.triggerProps">
          <span>{{ api.valueAsString || "Select option" }}</span>
          <span v-bind="api.indicatorProps">▼</span>
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
        <select v-bind="api.hiddenSelectProps">
          <option v-for="option in selectData" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </form>
      <Teleport to="body">
        <div v-bind="api.positionerProps">
          <ul v-bind="api.contentProps">
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
    <StateVisualizer :state="state" :omit="['collection']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

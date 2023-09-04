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

const CaretIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    stroke-width="0"
    viewBox="0 0 1024 1024"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z"></path>
  </svg>
)
</script>

<template>
  <main class="select">
    <div class="control">
      <label v-bind="api.labelProps">Label</label>
      <button v-bind="api.triggerProps">
        <span>{{ api.valueAsString || "Select option" }}</span>
        <CaretIcon />
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
            <span>{{ item.label }}</span>
            <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
          </li>
        </ul>
      </div>
    </Teleport>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :config="controls.config" :state="controls.context" />
    </template>
  </Toolbar>
</template>

<script setup lang="ts">
import * as select from "@zag-js/select"
import { selectControls, selectData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import serialize from "form-serialize"
import { ChevronsUpDownIcon, XIcon } from "lucide-vue-next"
import "@styles/select.css"

interface Item {
  label: string
  value: string
}

const controls = useControls(selectControls)

const service = useMachine(
  select.machine as select.Machine<Item>,
  controls.mergeProps<select.Props<Item>>({
    collection: select.collection({ items: selectData }),
    id: useId(),
    name: "country",
    onHighlightChange(details) {
      console.log("onHighlightChange", details)
    },
    onValueChange(details) {
      console.log("onChange", details)
    },
    onOpenChange(details) {
      console.log("onOpenChange", details)
    },
  }),
)

const api = computed(() => select.connect(service, normalizeProps))

function onFormChange(e: Event) {
  const formData = serialize(e.currentTarget as HTMLFormElement, { hash: true })
  console.log(formData)
}
</script>

<template>
  <main class="select">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Label</label>
      <div v-bind="api.getControlProps()">
        <button v-bind="api.getTriggerProps()">
          <span>{{ api.valueAsString || "Select option" }}</span>
        </button>
        <div class="select-indicator-group">
          <button v-bind="api.getClearTriggerProps()">
            <XIcon />
          </button>
          <span v-bind="api.getIndicatorProps()">
            <ChevronsUpDownIcon />
          </span>
        </div>
      </div>

      <form @change="onFormChange">
        <select v-bind="api.getHiddenSelectProps()">
          <option v-if="api.empty" value="" />
          <option v-for="option in selectData" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>
      </form>

      <Teleport to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <div v-bind="api.getContentProps()">
            <div v-bind="api.getListProps()">
              <div v-for="item in selectData" :key="item.value" v-bind="api.getItemProps({ item })">
                <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
                <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

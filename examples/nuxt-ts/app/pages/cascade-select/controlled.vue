<script setup lang="ts">
import * as cascadeSelect from "@zag-js/cascade-select"
import { cascadeSelectControls, cascadeSelectData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import serialize from "form-serialize"
import { XIcon } from "lucide-vue-next"
import "@styles/cascade-select.css"

interface Node {
  label: string
  value: string
  continents?: Node[]
  countries?: Node[]
  code?: string
  states?: Node[]
}

const collection = cascadeSelect.collection<Node>({
  nodeToValue: (node) => node.value,
  nodeToString: (node) => node.label,
  nodeToChildren: (node) => node.continents ?? node.countries ?? node.states,
  rootNode: cascadeSelectData,
})

const controls = useControls(cascadeSelectControls)

const open = ref(false)

const id = useId()
const controlProps = controls.mergeProps({})

const service = useMachine(
  cascadeSelect.machine,
  computed(() => ({
    id,
    collection,
    name: "location",
    open: open.value,
    onHighlightChange(details) {
      console.log("onHighlightChange", details)
    },
    onValueChange(details) {
      console.log("onChange", details)
    },
    onOpenChange(details) {
      open.value = details.open
      console.log("onOpenChange", details)
    },
    ...controlProps.value,
  })),
)

const api = computed(() => cascadeSelect.connect(service, normalizeProps))

const onFormChange = (e: Event) => {
  const formData = serialize(e.currentTarget as HTMLFormElement, { hash: true })
  console.log(formData)
}
</script>

<template>
  <main class="cascade-select">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Select a location</label>

      <button @click="open = !open">Toggle (external)</button>

      <div v-bind="api.getControlProps()">
        <button v-bind="api.getTriggerProps()">
          <span v-bind="api.getValueTextProps()">{{ api.valueAsString || "Select a location" }}</span>
          <span v-bind="api.getIndicatorProps()">▼</span>
        </button>
        <button v-bind="api.getClearTriggerProps()">
          <XIcon :size="16" />
        </button>
      </div>

      <form @change="onFormChange">
        <input v-bind="api.getHiddenInputProps()" />
      </form>

      <Teleport to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <div v-bind="api.getContentProps()">
            <CascadeSelectNode
              :node="collection.rootNode"
              :api="api"
              :collection="collection"
              :index-path="[]"
              :value="[]"
            />
          </div>
        </div>
      </Teleport>
    </div>

    <div style="margin-top: 350px">
      <h3>Highlighted Value:</h3>
      <pre>{{ JSON.stringify(api.highlightedValue, null, 2) }}</pre>
    </div>
    <div style="margin-top: 20px">
      <h3>Selected Value:</h3>
      <pre>{{ JSON.stringify(api.value, null, 2) }}</pre>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :omit="['collection']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

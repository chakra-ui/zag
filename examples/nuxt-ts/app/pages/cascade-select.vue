<script setup lang="ts">
import * as cascadeSelect from "@zag-js/cascade-select"
import { cascadeSelectControls, cascadeSelectData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

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

const service = useMachine(
  cascadeSelect.machine,
  controls.mergeProps<cascadeSelect.Props>({
    id: useId(),
    collection,
    name: "location",
  }),
)

const api = computed(() => cascadeSelect.connect(service, normalizeProps))
</script>

<template>
  <main class="cascade-select">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Select a location</label>

      <div v-bind="api.getControlProps()">
        <button v-bind="api.getTriggerProps()">
          <span>{{ api.valueAsString || "Select a location" }}</span>
          <span v-bind="api.getIndicatorProps()">▼</span>
        </button>
        <button v-bind="api.getClearTriggerProps()">X</button>
      </div>

      <input v-bind="api.getHiddenInputProps()" />

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

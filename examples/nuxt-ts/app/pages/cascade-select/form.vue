<script setup lang="ts">
import * as cascadeSelect from "@zag-js/cascade-select"
import { cascadeSelectData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronsUpDownIcon } from "lucide-vue-next"
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

const id = useId()
const value = ref<string[][]>([])
const submitted = ref(false)
const output = ref("")

const invalid = computed(() => submitted.value && value.value.length === 0)

const service = useMachine(
  cascadeSelect.machine,
  computed<cascadeSelect.Props<Node>>(() => ({
    id,
    collection,
    name: "region",
    required: true,
    invalid: invalid.value,
    onValueChange: (details) => (value.value = details.value),
  })),
)
const api = computed(() => cascadeSelect.connect(service, normalizeProps))

function onSubmit(event: Event) {
  submitted.value = true
  if (value.value.length === 0) return
  const data = new FormData(event.currentTarget as HTMLFormElement)
  output.value = [...data.entries()].map(([key, entry]) => `${key}=${entry}`).join("\n")
}

function onReset() {
  api.value.clearValue()
  submitted.value = false
  output.value = ""
}
</script>

<template>
  <main>
    <div class="cascade-select-form">
      <form novalidate @submit.prevent="onSubmit" @reset="onReset">
        <div v-bind="api.getRootProps()">
          <label v-bind="api.getLabelProps()">Delivery region</label>
          <div v-bind="api.getControlProps()">
            <button v-bind="api.getTriggerProps()">
              <span v-bind="api.getValueTextProps()">{{ api.valueAsString || "Select a region" }}</span>
            </button>
            <span v-bind="api.getIndicatorProps()">
              <ChevronsUpDownIcon />
            </span>
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
        <p v-if="invalid" class="error" role="alert">Choose a delivery region</p>
        <div class="actions">
          <button type="submit">Save address</button>
          <button type="reset">Clear form</button>
        </div>
      </form>
      <pre v-if="output" data-testid="form-output">{{ output }}</pre>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" :omit="['collection']" />
  </Toolbar>
</template>

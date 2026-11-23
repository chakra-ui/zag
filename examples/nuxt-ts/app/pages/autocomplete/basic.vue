<script setup lang="ts">
import * as autocomplete from "@zag-js/autocomplete"
import { createFilter } from "@zag-js/utils/search"
import { autocompleteControls, comboboxData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/autocomplete.css"

interface Item {
  code: string
  label: string
}

const { contains } = createFilter({ sensitivity: "base" })

const controls = useControls(autocompleteControls)

const value = ref("")
const submitted = ref<string | null>(null)

// `list` and `both` show suggestions that match the text
const items = computed(() => {
  const mode = controls.context.value.mode
  const filtered = mode === "list" || mode === "both"
  return filtered ? comboboxData.filter((item) => contains(item.label, value.value)) : comboboxData
})

const collection = computed(() =>
  autocomplete.collection<Item>({
    items: items.value,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  }),
)

const id = useId()
const controlProps = controls.mergeProps({})

const service = useMachine(
  autocomplete.machine as autocomplete.Machine<Item>,
  computed(() => ({
    id,
    collection: collection.value,
    name: "country",
    placeholder: "Search countries",
    value: value.value,
    onValueChange: (details: autocomplete.ValueChangeDetails) => {
      value.value = details.value
    },
    ...controlProps.value,
  })),
)

const api = computed(() => autocomplete.connect(service, normalizeProps))

const onSubmit = (event: Event) => {
  submitted.value = String(new FormData(event.currentTarget as HTMLFormElement).get("country"))
}
</script>

<template>
  <main class="autocomplete">
    <form class="autocomplete-form" @submit.prevent="onSubmit">
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Country</label>
        <div v-bind="api.getControlProps()">
          <input v-bind="api.getInputProps()" />
          <button v-bind="api.getClearTriggerProps()">
            <XIcon />
          </button>
          <button v-bind="api.getTriggerProps()">▼</button>
        </div>
      </div>
      <button type="submit">Submit</button>
    </form>

    <pre data-testid="output">
value: {{ JSON.stringify(api.value) }}
submitted: {{ submitted == null ? "—" : JSON.stringify(submitted) }}</pre>

    <div v-bind="api.getPositionerProps()">
      <div v-bind="api.getContentProps()">
        <div v-bind="api.getEmptyProps()">No countries match</div>
        <ul v-bind="api.getListProps()">
          <li v-for="item in items" :key="item.code" v-bind="api.getItemProps({ item })">
            <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
          </li>
        </ul>
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

<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { comboboxControls, comboboxData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/combobox.css"

interface Item {
  code: string
  label: string
}

const { contains } = createFilter({ sensitivity: "base" })

const controls = useControls(comboboxControls)
const controlProps = controls.mergeProps({})

const options = ref(comboboxData)
const submitCount = ref(0)
const lastSubmit = ref<string | null>(null)

const collection = computed(() =>
  combobox.collection<Item>({
    items: options.value,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  }),
)

const id = useId()
const service = useMachine(
  combobox.machine as combobox.Machine<Item>,
  computed(() => ({
    id,
    collection: collection.value,
    name: "country",
    onOpenChange() {
      options.value = comboboxData
    },
    onInputValueChange({ inputValue }) {
      options.value = comboboxData.filter((item) => contains(item.label, inputValue))
    },
    ...controlProps.value,
  })),
)

const api = computed(() => combobox.connect(service, normalizeProps))

const onSubmit = (e: Event) => {
  const data = new FormData(e.currentTarget as HTMLFormElement)
  submitCount.value++
  lastSubmit.value = String(data.get("country") ?? "")
}
</script>

<template>
  <main class="combobox">
    <form @submit.prevent="onSubmit">
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Select country</label>
        <div v-bind="api.getControlProps()">
          <input data-testid="input" v-bind="api.getInputProps()" />
          <button data-testid="trigger" type="button" v-bind="api.getTriggerProps()">▼</button>
          <button type="button" v-bind="api.getClearTriggerProps()">
            <XIcon />
          </button>
        </div>
      </div>
      <div v-bind="api.getPositionerProps()">
        <ul v-if="options.length > 0" data-testid="combobox-content" v-bind="api.getContentProps()">
          <li v-for="item in options" :key="item.code" :data-testid="item.code" v-bind="api.getItemProps({ item })">
            <span v-bind="api.getItemIndicatorProps({ item })">✅</span>
            <span>{{ item.label }}</span>
          </li>
        </ul>
      </div>

      <div style="margin-top: 16px">
        <button type="submit">Submit</button>
      </div>
    </form>

    <section style="margin-top: 16px">
      <strong>submit count:</strong> <span data-testid="submit-count">{{ submitCount }}</span>
      <br />
      <strong>last submitted value:</strong> <span data-testid="last-submit">{{ lastSubmit ?? "—" }}</span>
    </section>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

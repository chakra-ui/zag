<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { comboboxData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/combobox.css"

interface Item {
  code: string
  label: string
}

const { contains } = createFilter({ sensitivity: "base" })

const options = ref(comboboxData)

const collection = computed(() =>
  combobox.collection({
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
    onInputValueChange({ inputValue }) {
      options.value = comboboxData.filter((item) => contains(item.label, inputValue))
    },
    allowCustomValue: true,
  })),
)

const api = computed(() => combobox.connect(service, normalizeProps))

const onSubmit = (e: Event) => {
  const data = new FormData(e.currentTarget as HTMLFormElement)
  console.log(data.get("country"))
}
</script>

<template>
  <main class="combobox">
    <form @submit.prevent="onSubmit">
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Select country</label>
        <div v-bind="api.getControlProps()">
          <input data-testid="input" v-bind="api.getInputProps()" />
          <button data-testid="trigger" v-bind="api.getTriggerProps()">▼</button>
          <button v-bind="api.getClearTriggerProps()">
            <XIcon />
          </button>
        </div>
      </div>
      <div v-bind="api.getPositionerProps()">
        <div data-testid="combobox-content" v-bind="api.getContentProps()">
          <div v-if="options.length > 0" v-bind="api.getListProps()">
            <div v-for="item in options" :key="item.code" :data-testid="item.code" v-bind="api.getItemProps({ item })">
              <span v-bind="api.getItemIndicatorProps({ item })">✅</span>
              <span>{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </form>
  </main>
</template>

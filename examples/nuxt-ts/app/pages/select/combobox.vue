<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { selectData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/select.css"
import "@styles/combobox.css"

const { contains } = createFilter({ sensitivity: "base" })

const options = ref(selectData)

const collection = computed(() => combobox.collection({ items: options.value }))

const id = useId()
const service = useMachine(
  combobox.machine,
  computed<combobox.Props>(() => ({
    id,
    collection: collection.value,
    popupType: "dialog",
    selectionBehavior: "clear",
    inputBehavior: "autohighlight",
    onOpenChange() {
      options.value = selectData
    },
    onInputValueChange({ inputValue }) {
      const filtered = selectData.filter((item) => contains(item.label, inputValue))
      options.value = filtered.length > 0 ? filtered : selectData
    },
  })),
)

const api = computed(() => combobox.connect(service, normalizeProps))
</script>

<template>
  <main class="select">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Country</label>
      <div v-bind="api.getControlProps()">
        <button v-bind="api.getTriggerProps({ focusable: true })">{{ api.valueAsString || "Select Country" }}</button>
      </div>

      <Teleport to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <div v-bind="api.getContentProps()">
            <input v-bind="api.getInputProps()" />
            <div v-bind="api.getListProps()">
              <div v-for="item in options" :key="item.value" v-bind="api.getItemProps({ item })">
                {{ item.label }}
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </main>
</template>

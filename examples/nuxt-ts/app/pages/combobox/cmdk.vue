<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import * as dialog from "@zag-js/dialog"
import { createHotkeyStore } from "@zag-js/hotkeys"
import { createFilter } from "@zag-js/i18n-utils"
import { commandData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/cmdk.css"

const { allItems, commands, applications, suggestions } = commandData
const { contains } = createFilter({ sensitivity: "base" })

function filter(value: string): Record<string, commandData.Command[]> {
  if (!value) {
    return {
      Suggestions: suggestions,
      Commands: commands.filter((item) => !suggestions.includes(item)),
      Apps: applications.filter((item) => !suggestions.includes(item)),
    }
  }

  const results = allItems.filter((item) => contains(item.name, value) || contains(item.title, value))

  if (!results.length) return {}

  return { Results: results }
}

const inputValue = ref("")
const selectedAction = ref<string | null>(null)

const matches = computed(() => filter(inputValue.value))

const collection = computed(() =>
  combobox.collection({
    items: Object.values(matches.value).flat(),
    itemToValue: (item) => item.name,
    itemToString: (item) => item.title,
  }),
)

const service = useMachine(dialog.machine, {
  id: useId(),
  onOpenChange({ open }) {
    if (!open) inputValue.value = ""
  },
})
const dialogApi = computed(() => dialog.connect(service, normalizeProps))

const store = createHotkeyStore()
store.register({ id: "cmdk", hotkey: "/", action: () => dialogApi.value.setOpen(true) })

onMounted(() => store.init({ target: document }))
onBeforeUnmount(() => store.destroy())

const onValueChange = ({ items }: combobox.ValueChangeDetails<commandData.Command>) => {
  selectedAction.value = JSON.stringify(items[0]?.title)
  dialogApi.value.setOpen(false)
}
</script>

<template>
  <main>
    <button v-bind="dialogApi.getTriggerProps()">Open Command Menu</button>
    <p>or press <kbd>/</kbd></p>

    <div v-if="selectedAction"><b>Selected Action:</b> {{ selectedAction }}</div>

    <Teleport v-if="dialogApi.open" to="body">
      <div v-bind="dialogApi.getBackdropProps()" />
      <div v-bind="dialogApi.getPositionerProps()">
        <div v-bind="dialogApi.getContentProps()">
          <ComboboxCommandMenu
            :matches="matches"
            :collection="collection"
            @value-change="onValueChange"
            @input-value-change="({ inputValue: v }) => (inputValue = v)"
          />
        </div>
      </div>
    </Teleport>
  </main>
</template>

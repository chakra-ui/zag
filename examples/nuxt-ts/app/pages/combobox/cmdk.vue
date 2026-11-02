<script setup lang="ts">
import { PageListCollection } from "@zag-js/collection"
import * as dialog from "@zag-js/dialog"
import { createHotkeyStore } from "@zag-js/hotkeys"
import { commandData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/cmdk.css"

type Item = commandData.PageItem

const createCollection = () =>
  new PageListCollection<Item>({
    items: commandData.pageItems,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
    groupBy: (item) => item.group,
  })

const selectedAction = ref<string | null>(null)
// shallow: the collection is immutable and replaced on every change
const pages = shallowRef(createCollection())
const query = ref("")

const navigate = (next: PageListCollection<Item>, nextQuery: string) => {
  pages.value = next
  query.value = nextQuery
}

const service = useMachine(dialog.machine, {
  id: useId(),
  onEscapeKeyDown(event) {
    // Escape goes back a page before it closes the dialog
    if (!pages.value.canGoBack) return
    event.preventDefault()
    const next = pages.value.back(query.value)
    navigate(next, next.restore.query)
  },
  onOpenChange({ open }) {
    if (!open) navigate(pages.value.reset(), "")
  },
})
const dialogApi = computed(() => dialog.connect(service, normalizeProps))

const store = createHotkeyStore()
store.register({ id: "cmdk", hotkey: "/", action: () => dialogApi.value.setOpen(true) })

onMounted(() => store.init({ target: document }))
onBeforeUnmount(() => store.destroy())

const onAction = (item: Item) => {
  selectedAction.value = item.label
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
            :pages="pages"
            :query="query"
            @navigate="navigate"
            @query-change="(value) => (query = value)"
            @action="onAction"
          />
        </div>
      </div>
    </Teleport>
  </main>
</template>

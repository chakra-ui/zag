<script setup lang="ts">
import * as asyncList from "@zag-js/async-list"
import * as combobox from "@zag-js/combobox"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/combobox.css"

interface Item {
  name: string
  url: string
}

const selected = ref<string[]>([])

const listService = useMachine(asyncList.machine as asyncList.Machine<Item>, {
  autoReload: true,
  async load({ signal, filter }) {
    const response = await fetch(`https://swapi.py4e.com/api/people/?search=${filter ?? ""}`, { signal })
    const data = await response.json()
    return {
      items: data.results ?? [],
      cursor: data.next ?? null,
    }
  },
})

const list = computed(() => asyncList.connect(listService))

const collection = computed(() =>
  combobox.collection({
    items: list.value.items,
    itemToValue: (item) => item.name,
    itemToString: (item) => item.name,
  }),
)

const id = useId()
const service = useMachine(
  combobox.machine as combobox.Machine<Item>,
  computed(() => ({
    id,
    collection: collection.value,
    placeholder: "Search people...",
    onInputValueChange({ inputValue }) {
      list.value.setFilter(inputValue)
    },
    onValueChange({ value }) {
      selected.value = value
    },
  })),
)

const api = computed(() => combobox.connect(service, normalizeProps))
</script>

<template>
  <main class="combobox" style="padding: 2rem">
    <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 360px">
      <div data-testid="selected-value" style="font-size: 0.875rem">
        <strong>Selected:</strong> {{ selected.join(", ") }}
      </div>

      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Search Star Wars characters</label>
        <div v-bind="mergeProps(api.getControlProps(), { style: { display: 'flex', marginTop: '4px' } })">
          <input
            data-testid="input"
            v-bind="mergeProps(api.getInputProps(), { style: { flex: 1, padding: '8px 12px' } })"
          />
          <button data-testid="trigger" v-bind="mergeProps(api.getTriggerProps(), { style: { padding: '8px' } })">
            ▼
          </button>
        </div>
      </div>

      <div v-if="list.isLoading" data-testid="loading" style="font-size: 0.875rem">Loading...</div>

      <div v-bind="api.getPositionerProps()">
        <div
          data-testid="combobox-content"
          v-bind="mergeProps(api.getContentProps(), { style: { listStyle: 'none', padding: '4px' } })"
        >
          <div v-if="api.collection.items.length > 0" v-bind="api.getListProps()">
            <div
              v-for="item in api.collection.items"
              :key="item.name"
              :data-testid="`item-${item.name}`"
              v-bind="api.getItemProps({ item })"
              style="padding: 8px 12px; cursor: pointer"
            >
              {{ item.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

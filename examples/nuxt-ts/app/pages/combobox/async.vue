<script setup lang="ts">
import * as asyncList from "@zag-js/async-list"
import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { CheckIcon, ChevronsUpDownIcon, LoaderCircleIcon, XIcon } from "lucide-vue-next"
import "@styles/combobox.css"

interface Person {
  name: string
  url: string
  birth_year?: string
}

// Resolves after `ms`, or rejects when the request is superseded
const delay = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })

const selected = ref<string[]>([])

const listService = useMachine(asyncList.machine as asyncList.Machine<Person>, {
  autoReload: true,
  // Keep showing the last results while the next query loads
  keepPreviousItems: true,
  async load({ signal, filter }) {
    // Debounce: each keystroke aborts the pending wait
    await delay(250, signal)
    const response = await fetch(`https://swapi.py4e.com/api/people/?search=${filter ?? ""}`, { signal })
    if (!response.ok) throw new Error(`Request failed (${response.status})`)
    const data = await response.json()
    return { items: data.results ?? [] }
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
  combobox.machine as combobox.Machine<Person>,
  computed(() => ({
    id,
    collection: collection.value,
    placeholder: "Search people…",
    onInputValueChange({ inputValue, reason }) {
      // Selecting an item fills the input; that shouldn't trigger a search
      if (reason === "item-select") return
      list.value.setFilter(inputValue)
    },
    onValueChange({ value }) {
      selected.value = value
    },
  })),
)

const api = computed(() => combobox.connect(service, normalizeProps))

const status = computed(() => {
  const { error, isLoading, isEmpty, filter } = list.value
  if (error || !isEmpty) return null
  if (isLoading) return "Searching…"
  const query = filter?.trim()
  return query ? `No people match “${query}”` : "No people found"
})
</script>

<template>
  <main class="combobox">
    <div class="vstack gap-6">
      <Output label="Selected" :value="selected.join(', ') || '—'" data-testid="selected-value" />

      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Star Wars character</label>
        <div v-bind="api.getControlProps()">
          <input data-testid="input" v-bind="api.getInputProps()" />
          <LoaderCircleIcon v-if="list.isLoading" class="combobox-spinner" aria-hidden="true" data-testid="loading" />
          <button v-bind="api.getClearTriggerProps()">
            <XIcon />
          </button>
          <button data-testid="trigger" v-bind="api.getTriggerProps()">
            <ChevronsUpDownIcon />
          </button>
        </div>
      </div>

      <div v-bind="api.getPositionerProps()">
        <div data-testid="combobox-content" v-bind="api.getContentProps()" :aria-busy="list.isLoading || undefined">
          <div v-bind="api.getEmptyProps()">
            <span v-if="list.error" class="combobox-status" data-type="error">
              Couldn’t load people.
              <button type="button" @click="list.reload()">Retry</button>
            </span>
            <template v-else>{{ status ?? "" }}</template>
          </div>
          <div v-if="!list.isEmpty" v-bind="api.getListProps()">
            <div
              v-for="item in list.items"
              :key="item.name"
              :data-testid="`item-${item.name}`"
              v-bind="api.getItemProps({ item })"
            >
              <span v-bind="api.getItemTextProps({ item })">{{ item.name }}</span>
              <span v-if="item.birth_year" class="combobox-item-meta">{{ item.birth_year }}</span>
              <span v-bind="api.getItemIndicatorProps({ item })">
                <CheckIcon />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

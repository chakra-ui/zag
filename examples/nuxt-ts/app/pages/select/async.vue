<script setup lang="ts">
import * as select from "@zag-js/select"
import { selectControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronsUpDownIcon, XIcon } from "lucide-vue-next"
import "@styles/select.css"

interface Item {
  name: string
  url: string
}

const controls = useControls(selectControls)

const items = ref<Item[]>([])

onMounted(async () => {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon`)
  const json = await res.json()
  items.value = json.results
})

const collection = computed(() =>
  select.collection({
    items: items.value,
    itemToString(item) {
      return item.name
    },
    itemToValue(item) {
      return item.name
    },
  }),
)

const id = useId()
const service = useMachine(
  select.machine as select.Machine<Item>,
  computed(() => ({ id, collection: collection.value })),
)

const api = computed(() => select.connect(service, normalizeProps))
</script>

<template>
  <main class="select">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Label</label>
      <div v-bind="api.getControlProps()">
        <button v-bind="api.getTriggerProps()">
          <span>{{ api.hasSelectedItems ? api.valueAsString : "Select option" }}</span>
        </button>
        <div class="select-indicator-group">
          <button v-bind="api.getClearTriggerProps()">
            <XIcon />
          </button>
          <span v-bind="api.getIndicatorProps()">
            <ChevronsUpDownIcon />
          </span>
        </div>
      </div>

      <Teleport to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <div v-bind="api.getContentProps()">
            <div v-bind="api.getListProps()">
              <div v-for="item in items" :key="item.name" v-bind="api.getItemProps({ item })">
                <span v-bind="api.getItemTextProps({ item })">{{ item.name }}</span>
                <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

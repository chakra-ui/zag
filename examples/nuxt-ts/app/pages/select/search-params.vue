<script setup lang="ts">
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronsUpDownIcon } from "lucide-vue-next"
import "@styles/select.css"

const collection = select.collection({
  items: selectData,
  itemToString: (item) => item.label,
  itemToValue: (item) => item.value,
})

const route = useRoute()
const router = useRouter()

const selectedCountry = computed(() => {
  const value = route.query.country
  return typeof value === "string" ? value : null
})

const setCountry = (country: string | undefined) => {
  router.push(`${route.path}?country=${country}`)
}

const id = useId()
const service = useMachine(
  select.machine,
  computed<select.Props>(() => ({
    id,
    collection,
    value: selectedCountry.value ? [selectedCountry.value] : undefined,
    onValueChange: (details) => setCountry(details.value[0]),
  })),
)

const api = computed(() => select.connect(service, normalizeProps))
</script>

<template>
  <div style="padding: 40px">
    <h1>{{ selectedCountry ?? "-" }}</h1>

    <div style="display: flex; gap: 12px; margin-bottom: 24px">
      <button @click="setCountry(selectData[0]!.value)">Change to {{ selectData[0]!.label }}</button>
      <button @click="setCountry(selectData[1]!.value)">Change to {{ selectData[1]!.label }}</button>
    </div>

    <div v-bind="api.getRootProps()">
      <div v-bind="api.getControlProps()">
        <label v-bind="api.getLabelProps()">Label</label>
        <button v-bind="api.getTriggerProps()">
          <span>{{ api.valueAsString || "Select a country" }}</span>
          <span v-bind="api.getIndicatorProps()">
            <ChevronsUpDownIcon />
          </span>
        </button>
      </div>

      <Teleport to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <div v-bind="api.getContentProps()">
            <ul v-bind="api.getListProps()">
              <li v-for="item in selectData" :key="item.value" v-bind="api.getItemProps({ item })">
                <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
                <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
              </li>
            </ul>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

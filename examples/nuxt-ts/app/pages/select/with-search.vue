<script setup lang="ts">
import { createFilter } from "@zag-js/i18n-utils"
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronsUpDownIcon } from "lucide-vue-next"
import "@styles/select.css"

interface Item {
  label: string
  value: string
}

const { contains } = createFilter({ sensitivity: "base" })

const search = ref("")

const collection = computed(() =>
  select.collection({
    items: selectData.filter((item) => contains(item.label, search.value)),
  }),
)

const id = useId()

const service = useMachine(
  select.machine as select.Machine<Item>,
  computed<select.Props<Item>>(() => ({
    id,
    collection: collection.value,
    popupType: "dialog",
    onOpenChange(details) {
      if (!details.open) search.value = ""
    },
  })),
)

const api = computed(() => select.connect(service, normalizeProps))
</script>

<template>
  <main class="select">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getControlProps()">
        <label v-bind="api.getLabelProps()">Country</label>
        <button v-bind="api.getTriggerProps()">
          <span v-bind="api.getValueTextProps()">{{ api.valueAsString || "Select country" }}</span>
          <span v-bind="api.getIndicatorProps()">
            <ChevronsUpDownIcon />
          </span>
        </button>
      </div>

      <Teleport to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <div v-bind="api.getContentProps()">
            <input
              v-bind="api.getInputProps()"
              aria-label="Filter countries"
              placeholder="Filter…"
              :value="search"
              @input="search = ($event.target as HTMLInputElement).value"
            />

            <div v-bind="api.getListProps()">
              <div v-for="item in collection.items" :key="item.value" v-bind="api.getItemProps({ item })">
                <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
                <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
              </div>
            </div>

            <div v-bind="api.getEmptyProps()">
              <template v-if="collection.size === 0">No matches for "{{ search }}"</template>
            </div>

            <div data-select-footer="">
              <span>{{ collection.size }} of {{ selectData.length }}</span>
              <button v-if="api.hasSelectedItems" type="button" @click="api.clearValue()">Clear</button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </main>
</template>

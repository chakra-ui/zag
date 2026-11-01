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

const service = useMachine(select.machine, {
  id: useId(),
  collection,
})

const api = computed(() => select.connect(service, normalizeProps))
</script>

<template>
  <div style="padding-block: 32px; max-width: 400px">
    <div style="display: flex; flex-direction: column; gap: 12px">
      <h1>Page</h1>

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

      <button type="button" @click="navigateTo('/')">Go to main page</button>
      <button type="button" @click="navigateTo('/')">Go to main page</button>
      <button type="button" @click="navigateTo('/')">Go to main page</button>
    </div>
  </div>
</template>

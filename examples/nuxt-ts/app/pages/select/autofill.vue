<script setup lang="ts">
// Manual test: save an address in Chrome, autofill the street input, and the State select should update
import * as select from "@zag-js/select"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronsUpDownIcon } from "lucide-vue-next"
import "@styles/select.css"

const US_STATES = [
  { label: "Alabama", value: "AL" },
  { label: "California", value: "CA" },
  { label: "Florida", value: "FL" },
  { label: "New York", value: "NY" },
  { label: "Texas", value: "TX" },
]

const service = useMachine(select.machine, {
  collection: select.collection({ items: US_STATES }),
  id: useId(),
  name: "state",
  autoComplete: "address-level1",
})

const api = computed(() => select.connect(service, normalizeProps))

function onSubmit(e: Event) {
  console.log("Form submitted", Object.fromEntries(new FormData(e.currentTarget as HTMLFormElement)))
}
</script>

<template>
  <main style="padding: 2rem; max-width: 400px">
    <h1>Select Autofill Test</h1>
    <p style="margin-bottom: 1rem; color: #666">
      Fill street address first, then use Chrome autofill. State should update.
    </p>

    <form @submit.prevent="onSubmit">
      <div style="margin-bottom: 1rem">
        <label for="street">Street address</label>
        <input
          id="street"
          name="street"
          type="text"
          autocomplete="street-address"
          style="display: block; width: 100%; padding: 8px; margin-top: 4px"
        />
      </div>

      <div v-bind="api.getRootProps()" style="margin-bottom: 1rem">
        <label v-bind="api.getLabelProps()">State</label>
        <div v-bind="api.getControlProps()">
          <button
            v-bind="api.getTriggerProps()"
            style="
              display: flex;
              width: 100%;
              padding: 8px;
              margin-top: 4px;
              justify-content: space-between;
              align-items: center;
            "
          >
            <span>{{ api.valueAsString || "Select state" }}</span>
            <span v-bind="api.getIndicatorProps()">
              <ChevronsUpDownIcon />
            </span>
          </button>
        </div>

        <select v-bind="api.getHiddenSelectProps()">
          <option v-if="api.empty" value="" />
          <option v-for="opt in US_STATES" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>

        <Teleport to="#teleports">
          <div v-bind="api.getPositionerProps()">
            <div v-bind="api.getContentProps()">
              <div v-bind="api.getListProps()">
                <div v-for="item in US_STATES" :key="item.value" v-bind="api.getItemProps({ item })">
                  <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </Teleport>
      </div>

      <button type="submit">Submit</button>
    </form>
  </main>
</template>

<script setup lang="ts">
import * as listbox from "@zag-js/listbox"
import { Car, CookingPot, Coffee, Dumbbell, PawPrint, Snowflake, Waves, Wifi } from "lucide-vue-next"
import { listboxData, type ListboxOption } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/listbox.css"

const collection = listbox.collection({ items: listboxData.amenities })

const icons: Record<string, unknown> = {
  wifi: Wifi,
  parking: Car,
  pool: Waves,
  gym: Dumbbell,
  breakfast: Coffee,
  pets: PawPrint,
  ac: Snowflake,
  kitchen: CookingPot,
}

const service = useMachine(listbox.machine as listbox.Machine<ListboxOption>, {
  collection,
  id: useId(),
  orientation: "horizontal",
  selectionMode: "multiple",
  defaultValue: ["wifi", "breakfast"],
})

const api = computed(() => listbox.connect(service, normalizeProps))
</script>

<template>
  <main class="listbox listbox-tags">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Amenities</label>
      <div v-bind="api.getContentProps()">
        <ul v-bind="api.getListProps()">
          <li
            v-for="item in listboxData.amenities"
            :key="item.value"
            v-bind="api.getItemProps({ item, highlightOnHover: true })"
          >
            <component :is="icons[item.value]" class="listbox-item-icon" aria-hidden="true" />
            <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
            <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
          </li>
        </ul>
      </div>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" :context="['value', 'highlightedValue']" />
  </Toolbar>
</template>

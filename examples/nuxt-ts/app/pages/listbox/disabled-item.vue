<script setup lang="ts">
import * as listbox from "@zag-js/listbox"
import { listboxControls, listboxData, type ListboxOption } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/listbox.css"

// "Same day" is disabled through its `disabled` field
const collection = listbox.collection({ items: listboxData.shippingMethods })

const controls = useControls(listboxControls)

const service = useMachine(
  listbox.machine,
  controls.mergeProps<listbox.Props<ListboxOption>>({
    collection,
    id: useId(),
    defaultValue: ["standard"],
  }),
)

const api = computed(() => listbox.connect(service, normalizeProps))
</script>

<template>
  <main class="listbox">
    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Shipping method</label>
      <div v-bind="api.getContentProps()">
        <ul v-bind="api.getListProps()">
          <li
            v-for="item in listboxData.shippingMethods"
            :key="item.value"
            v-bind="api.getItemProps({ item, highlightOnHover: true })"
          >
            <div class="listbox-item-body">
              <span v-bind="api.getItemTextProps({ item })">{{ item.label }}</span>
              <span class="listbox-item-description">{{ item.description }}</span>
            </div>
            <span v-bind="api.getItemIndicatorProps({ item })">✓</span>
          </li>
        </ul>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :context="['value', 'highlightedValue']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

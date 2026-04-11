<script setup lang="ts">
import * as gridlist from "@zag-js/gridlist"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { gridListControls, gridListData } from "@zag-js/shared"
import { CheckIcon } from "lucide-vue-next"

interface Mailbox {
  id: string
  name: string
  description: string
  badge: string
}

const controls = useControls(gridListControls)
const lastAction = ref<string | null>(null)

const collection = gridlist.collection<Mailbox>({
  items: gridListData,
  itemToValue: (item) => item.id,
  itemToString: (item) => item.name,
})

const service = useMachine(
  gridlist.machine,
  controls.mergeProps<gridlist.Props<Mailbox>>({
    id: useId(),
    collection,
    onAction({ value }) {
      const item = gridListData.find((d) => d.id === value)
      lastAction.value = item ? `Opened ${item.name}` : null
    },
  }),
)

const api = computed(() => gridlist.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div class="gridlist">
      <div v-bind="api.getRootProps()">
        <label v-bind="api.getLabelProps()">Mailboxes</label>
        <div v-bind="api.getContentProps()">
          <div
            v-for="item in gridListData"
            :key="item.id"
            v-bind="api.getItemProps({ item, focusOnHover: true })"
          >
            <div v-bind="api.getCellProps()">
              <button v-if="api.showCheckboxes" v-bind="api.getItemCheckboxProps({ item })">
                <CheckIcon v-bind="api.getItemIndicatorProps({ item })" />
              </button>
              <div class="gridlist-item-body">
                <span v-bind="api.getItemTextProps({ item })" class="gridlist-item-title">
                  {{ item.name }}
                </span>
                <span class="gridlist-item-description">{{ item.description }}</span>
              </div>
              <span class="gridlist-item-badge">{{ item.badge }}</span>
            </div>
          </div>
          <div v-bind="api.getEmptyProps()">No mailboxes</div>
        </div>
      </div>

      <p style="margin-top: 12px; font-size: 13px; color: #52525b">
        Selected: <strong>{{ api.valueAsString || "none" }}</strong>
        <span v-if="lastAction"> · {{ lastAction }}</span>
      </p>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :context="['focusedValue', 'value']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

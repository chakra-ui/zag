<script setup lang="ts">
import * as pagination from "@zag-js/pagination"
import { paginationControls, paginationData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-vue-next"
import "@styles/pagination.css"

const controls = useControls(paginationControls)
const details = ref({} as any)

const service = useMachine(
  pagination.machine,
  controls.mergeProps<pagination.Props>({
    id: useId(),
    count: paginationData.length,
    onPageChange(v) {
      details.value = v
    },
  }),
)

const api = computed(() => pagination.connect(service, normalizeProps))
const data = computed(() => api.value.slice(paginationData))
</script>

<template>
  <main class="pagination">
    <div class="pagination-layout">
      <table class="pagination-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in data" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.first_name }} {{ item.last_name }}</td>
            <td>{{ item.email }}</td>
          </tr>
        </tbody>
      </table>

      <div class="pagination-bar">
        <span class="pagination-summary">{{ api.pageRange.start + 1 }}–{{ api.pageRange.end }} of {{ api.count }}</span>
        <nav v-if="api.totalPages > 1" v-bind="api.getRootProps()">
          <ul>
            <li>
              <button v-bind="api.getPrevTriggerProps()">
                <ChevronLeftIcon />
              </button>
            </li>
            <template v-for="(page, i) in api.pages">
              <li v-if="page.type === 'page'" :key="page.value">
                <button :data-testid="`item-${page.value}`" v-bind="api.getItemProps(page)">
                  {{ page.value }}
                </button>
              </li>
              <li v-else :key="`ellipsis-${i}`">
                <span v-bind="api.getEllipsisProps({ index: i })">&#8230;</span>
              </li>
            </template>
            <li>
              <button v-bind="api.getNextTriggerProps()">
                <ChevronRightIcon />
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <Print title="Page change details" :value="details" />
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

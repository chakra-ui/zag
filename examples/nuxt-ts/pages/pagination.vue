<script lang="ts" setup>
import { paginationControls, paginationData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import * as pagination from "@zag-js/pagination"

const controls = useControls(paginationControls)
const details = ref({})

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
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>FIRST NAME</th>
          <th>LAST NAME</th>
          <th>EMAIL</th>
          <th>PHONE</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.first_name }}</td>
          <td>{{ item.last_name }}</td>
          <td>{{ item.email }}</td>
          <td>{{ item.phone }}</td>
        </tr>
      </tbody>
    </table>
    <template v-if="api.totalPages > 1">
      <nav v-bind="api.getRootProps()">
        <ul>
          <li>
            <button v-bind="api.getPrevTriggerProps()">Previous <span class="sr-only">Page</span></button>
          </li>
          <template v-for="(page, i) in api.pages" :key="i">
            <li v-if="page.type === 'page'">
              <button :data-testid="`item-${page.value}`" v-bind="api.getItemProps(page)">
                {{ page.value }}
              </button>
            </li>
            <li v-else>
              <span v-bind="api.getEllipsisProps({ index: i })">&#8230;</span>
            </li>
          </template>
          <li>
            <button v-bind="api.getNextTriggerProps()">Next <span class="sr-only">Page</span></button>
          </li>
        </ul>
      </nav>
    </template>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

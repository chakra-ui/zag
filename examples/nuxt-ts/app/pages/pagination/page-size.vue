<script setup lang="ts">
import * as pagination from "@zag-js/pagination"
import { paginationData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-vue-next"
import "@styles/pagination.css"

const pageSizes = [5, 10, 20, 50]

const props = { count: paginationData.length, defaultPageSize: 5 }

const selectId = useId()

const service = useMachine(pagination.machine, {
  id: useId(),
  ...props,
})

const api = computed(() => pagination.connect(service, normalizeProps))
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
          <tr v-for="item in api.slice(paginationData)" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.first_name }} {{ item.last_name }}</td>
            <td>{{ item.email }}</td>
          </tr>
        </tbody>
      </table>

      <div class="pagination-bar">
        <div class="pagination-page-size">
          <label :for="selectId">Rows per page</label>
          <select
            :id="selectId"
            :value="api.pageSize"
            @change="api.setPageSize(Number(($event.target as HTMLSelectElement).value))"
          >
            <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
          </select>
        </div>

        <div class="hstack gap-4">
          <!-- pageRange is zero-based and end-exclusive -->
          <span class="pagination-summary"
            >{{ api.pageRange.start + 1 }}–{{ api.pageRange.end }} of {{ api.count }}</span
          >
          <nav v-bind="api.getRootProps()">
            <ul>
              <li>
                <button v-bind="api.getPreviousTriggerProps()">
                  <ChevronLeftIcon />
                </button>
              </li>
              <li>
                <button v-bind="api.getNextTriggerProps()">
                  <ChevronRightIcon />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <ExampleProps :value="props" />
    </div>
  </main>
</template>

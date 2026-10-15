<script setup lang="ts">
import * as pagination from "@zag-js/pagination"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from "lucide-vue-next"
import "@styles/pagination.css"

const props = { count: 500, defaultPage: 12, siblingCount: 2 }

const service = useMachine(pagination.machine, { id: useId(), ...props })

const api = computed(() => pagination.connect(service, normalizeProps))
</script>

<template>
  <main class="pagination">
    <div class="vstack gap-4">
      <nav v-bind="api.getRootProps()">
        <ul>
          <li>
            <button v-bind="api.getFirstTriggerProps()">
              <ChevronsLeftIcon />
            </button>
          </li>
          <li>
            <button v-bind="api.getPreviousTriggerProps()">
              <ChevronLeftIcon />
            </button>
          </li>
          <template v-for="(page, i) in api.pages">
            <li v-if="page.type === 'page'" :key="page.value">
              <button v-bind="api.getItemProps(page)">{{ page.value }}</button>
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
          <li>
            <button v-bind="api.getLastTriggerProps()">
              <ChevronsRightIcon />
            </button>
          </li>
        </ul>
      </nav>
      <span class="pagination-summary">Page {{ api.page }} of {{ api.totalPages }}</span>
      <ExampleProps :value="props" />
    </div>
  </main>
</template>

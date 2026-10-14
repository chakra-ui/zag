<script setup lang="ts">
import * as pagination from "@zag-js/pagination"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-vue-next"
import "@styles/pagination.css"

// No page list: just prev/next and where you are
const props = { count: 120 }

const service = useMachine(pagination.machine, { id: useId(), ...props })

const api = computed(() => pagination.connect(service, normalizeProps))
</script>

<template>
  <main class="pagination">
    <div class="vstack gap-4">
      <nav v-bind="api.getRootProps()">
        <ul>
          <li>
            <button v-bind="api.getPrevTriggerProps()">
              <ChevronLeftIcon />
              <span>Previous</span>
            </button>
          </li>
          <li class="pagination-summary" aria-live="polite">Page {{ api.page }} of {{ api.totalPages }}</li>
          <li>
            <button v-bind="api.getNextTriggerProps()">
              <span>Next</span>
              <ChevronRightIcon />
            </button>
          </li>
        </ul>
      </nav>
      <ExampleProps :value="props" />
    </div>
  </main>
</template>

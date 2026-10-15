<script setup lang="ts">
import * as pagination from "@zag-js/pagination"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-vue-next"
import "@styles/pagination.css"

// Pages render as links; the URL is the source of truth
const route = useRoute()
const page = computed(() => Number(route.query.page ?? 1))

const props = computed(
  () =>
    ({
      count: 200,
      type: "link",
      page: page.value,
      getPageUrl: ({ page }: pagination.PageUrlDetails) => `?page=${page}`,
    }) as const,
)

const id = useId()

const service = useMachine(
  pagination.machine,
  computed(() => ({ id, ...props.value })),
)

const api = computed(() => pagination.connect(service, normalizeProps))
</script>

<template>
  <main class="pagination">
    <div class="vstack gap-4">
      <nav v-bind="api.getRootProps()">
        <ul>
          <li>
            <a v-bind="api.getPreviousTriggerProps()">
              <ChevronLeftIcon />
            </a>
          </li>
          <template v-for="(item, i) in api.pages">
            <li v-if="item.type === 'page'" :key="item.value">
              <a v-bind="api.getItemProps(item)">{{ item.value }}</a>
            </li>
            <li v-else :key="`ellipsis-${i}`">
              <span v-bind="api.getEllipsisProps({ index: i })">&#8230;</span>
            </li>
          </template>
          <li>
            <a v-bind="api.getNextTriggerProps()">
              <ChevronRightIcon />
            </a>
          </li>
        </ul>
      </nav>
      <span class="pagination-summary">
        Page {{ api.page }} of {{ api.totalPages }} · URL <code>{{ api.getPageUrl(api.page) }}</code>
      </span>
      <ExampleProps :value="props" />
    </div>
  </main>
</template>

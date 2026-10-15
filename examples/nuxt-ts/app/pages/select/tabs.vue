<script setup lang="ts">
import * as select from "@zag-js/select"
import * as tabs from "@zag-js/tabs"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronsUpDownIcon, GitBranchIcon, TagIcon } from "lucide-vue-next"
import "@styles/select.css"
import "@styles/tabs.css"

const branchData = [
  { value: "master", label: "master" },
  { value: "feature", label: "feature" },
  { value: "bugfix", label: "bugfix" },
  { value: "hotfix", label: "hotfix" },
  { value: "release", label: "release" },
  { value: "rsc", label: "rsc" },
]

const tagData = [
  { value: "v1.0.0", label: "v1.0.0" },
  { value: "v1.0.1", label: "v1.0.1" },
  { value: "v1.0.2", label: "v1.0.2" },
  { value: "v1.0.3", label: "v1.0.3" },
  { value: "v1.0.4", label: "v1.0.4" },
  { value: "v1.0.5", label: "v1.0.5" },
]

type SelectedTab = "branch" | "tag"

const selectedTab = ref<SelectedTab>("branch")
const highlighted = ref<string | null>(null)

const collection = computed(() => select.collection({ items: selectedTab.value === "branch" ? branchData : tagData }))

const listRef = ref<HTMLElement | null>(null)

const selectId = useId()
const selectService = useMachine(
  select.machine,
  computed<select.Props>(() => ({
    collection: collection.value,
    id: selectId,
    popupType: "dialog",
    highlightedValue: highlighted.value,
    initialFocusEl: () => listRef.value,
    onHighlightChange({ highlightedValue }) {
      highlighted.value = highlightedValue
    },
  })),
)

const selectApi = computed(() => select.connect(selectService, normalizeProps))

const tabsId = useId()
const tabService = useMachine(
  tabs.machine,
  computed<tabs.Props>(() => ({
    id: tabsId,
    value: selectedTab.value,
    virtualFocus: true,
    onValueChange(details) {
      selectedTab.value = details.value as SelectedTab
    },
  })),
)

const tabApi = computed(() => tabs.connect(tabService, normalizeProps))

watch(collection, async (next) => {
  if (!selectApi.value.open) return
  selectApi.value.setHighlightedValue(next.firstValue)
  await nextTick()
  listRef.value?.focus()
})

const tabListProps = computed(() =>
  mergeProps(tabApi.value.getListProps(), {
    onKeydown(event: KeyboardEvent) {
      if (event.key === "Home" || event.key === "End") {
        event.preventDefault()
      }
    },
  }),
)

const listProps = computed(() =>
  mergeProps(selectApi.value.getListProps(), {
    onKeydown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") tabApi.value.selectPrevious()
      else if (event.key === "ArrowRight") tabApi.value.selectNext()
      else return
      event.preventDefault()
    },
  }),
)
</script>

<template>
  <main class="select">
    <div v-bind="selectApi.getRootProps()">
      <div v-bind="selectApi.getControlProps()">
        <button v-bind="selectApi.getTriggerProps()">
          <GitBranchIcon v-if="selectedTab === 'branch'" />
          <TagIcon v-else />
          <span>{{ selectApi.valueAsString || "Select option" }}</span>
          <span v-bind="selectApi.getIndicatorProps()">
            <ChevronsUpDownIcon />
          </span>
        </button>
      </div>

      <Teleport to="#teleports">
        <div v-bind="selectApi.getPositionerProps()">
          <div v-bind="selectApi.getContentProps()">
            <div v-bind="tabApi.getRootProps()">
              <div data-stretch="" v-bind="tabListProps">
                <button v-bind="tabApi.getTriggerProps({ value: 'branch' })">Branch</button>
                <button v-bind="tabApi.getTriggerProps({ value: 'tag' })">Tags</button>
              </div>

              <div v-bind="tabApi.getContentProps({ value: 'branch' })">
                <div v-if="selectedTab === 'branch'" ref="listRef" v-bind="listProps">
                  <div
                    v-for="item in branchData"
                    :key="item.value"
                    v-bind="selectApi.getItemProps({ item, persistFocus: true })"
                  >
                    <span v-bind="selectApi.getItemTextProps({ item })">{{ item.label }}</span>
                  </div>
                </div>
              </div>

              <div v-bind="tabApi.getContentProps({ value: 'tag' })">
                <div v-if="selectedTab === 'tag'" ref="listRef" v-bind="listProps">
                  <div
                    v-for="item in tagData"
                    :key="item.value"
                    v-bind="selectApi.getItemProps({ item, persistFocus: true })"
                  >
                    <span v-bind="selectApi.getItemTextProps({ item })">{{ item.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </main>
</template>

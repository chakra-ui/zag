<script setup lang="ts">
import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import * as tabs from "@zag-js/tabs"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/combobox.css"
import "@styles/tabs.css"

const pages = {
  Page: [
    { value: "docs", label: "Docs" },
    { value: "examples", label: "Examples" },
    { value: "blog", label: "Blog" },
    { value: "community", label: "Community" },
    { value: "support", label: "Support" },
    { value: "contact", label: "Contact" },
    { value: "about", label: "About" },
    { value: "pricing", label: "Pricing" },
    { value: "login", label: "Login" },
    { value: "signup", label: "Signup" },
  ],
  Component: [
    { value: "select-tabs", label: "Select Tabs" },
    { value: "select-combobox", label: "Select Combobox" },
    { value: "combobox-tabs", label: "Combobox Tabs" },
    { value: "menu-button", label: "Menu Button" },
    { value: "menu-tabs", label: "Menu Tabs" },
    { value: "menu-combobox", label: "Menu Combobox" },
  ],
}

const flatPages = Object.entries(pages).flatMap(([category, pages]) => pages.map((page) => ({ ...page, category })))

function groupBy<T>(items: T[], key: keyof T): any {
  return items.reduce((acc: any, item) => {
    const value = item[key]
    if (!acc[value]) acc[value] = []
    acc[value].push(item)
    return acc
  }, {})
}

type SelectedTab = "Page" | "Component" | "All"
const categories: SelectedTab[] = ["All", "Page", "Component"]
const { contains } = createFilter({ sensitivity: "base" })

const selectedTab = ref<SelectedTab>("All")
const inputValue = ref("")

const matches = computed(() => {
  const allMatches = flatPages.filter((item) => contains(item.label, inputValue.value))
  const groups = groupBy(allMatches, "category")
  groups.All = allMatches
  return groups as Record<SelectedTab, typeof flatPages>
})

let selectedValueTab: SelectedTab = "Component"

const items = computed(() => matches.value[selectedTab.value] || [])
const collection = computed(() => combobox.collection({ items: items.value }))

const comboboxId = useId()
const service = useMachine(
  combobox.machine,
  computed(() => ({
    collection: collection.value,
    id: comboboxId,
    popupType: "dialog" as const,
    openOnClick: true,
    inputBehavior: "autohighlight" as const,
    positioning: {
      sameWidth: false,
    },
    onValueChange() {
      selectedValueTab = selectedTab.value
    },
    onInputValueChange(details: combobox.InputValueChangeDetails) {
      inputValue.value = details.inputValue
    },
    onOpenChange(details: combobox.OpenChangeDetails) {
      if (details.open) return
      inputValue.value = ""
      if (selectedValueTab === selectedTab.value) return
      selectedTab.value = selectedValueTab
    },
  })),
)

const comboboxApi = computed(() => combobox.connect(service, normalizeProps))

const tabsId = useId()
const tabService = useMachine(
  tabs.machine,
  computed(() => ({
    id: tabsId,
    virtualFocus: true,
    value: selectedTab.value,
    onValueChange(details: tabs.ValueChangeDetails) {
      selectedTab.value = details.value as SelectedTab
    },
  })),
)

const tabApi = computed(() => tabs.connect(tabService, normalizeProps))

const inputProps = computed(() =>
  mergeProps(comboboxApi.value.getInputProps(), {
    onKeydown(event: KeyboardEvent) {
      if (!comboboxApi.value.open) return

      if (event.key === "ArrowRight") {
        tabApi.value.selectNext()
        event.preventDefault()
      }

      if (event.key === "ArrowLeft") {
        tabApi.value.selectPrev()
        event.preventDefault()
      }
    },
  }),
)
</script>

<template>
  <main>
    <div v-bind="comboboxApi.getRootProps()">
      <pre>{{ comboboxApi.value }}</pre>
      <label v-bind="comboboxApi.getLabelProps()">Select country </label>
      <div v-bind="comboboxApi.getControlProps()">
        <input v-bind="inputProps" />
        <button v-bind="comboboxApi.getTriggerProps()">▼</button>
      </div>
    </div>
    <div v-bind="comboboxApi.getPositionerProps()">
      <div v-bind="comboboxApi.getContentProps()">
        <div v-bind="mergeProps(tabApi.getRootProps(), { style: { position: 'relative' } })">
          <div
            data-stretch=""
            v-bind="mergeProps(tabApi.getListProps(), { style: { position: 'sticky', top: '0', insetInline: '0' } })"
          >
            <button
              v-for="category in categories"
              :key="category"
              v-bind="tabApi.getTriggerProps({ value: category, disabled: !matches[category]?.length })"
            >
              {{ category }} ({{ matches[category]?.length || 0 }})
            </button>
          </div>

          <div v-if="!items.length" class="no-results">
            No item found for &quot;<strong>{{ inputValue }}</strong
            >&quot;
          </div>

          <div v-for="category in categories" :key="category" v-bind="tabApi.getContentProps({ value: category })">
            <div v-if="selectedTab === category" v-bind="comboboxApi.getListProps()">
              <div
                v-for="item in items"
                :key="item.value"
                v-bind="comboboxApi.getItemProps({ item, persistFocus: true })"
              >
                {{ item.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

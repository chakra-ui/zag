<script setup lang="ts">
import { createFilter } from "@zag-js/i18n-utils"
import { sidebarTree, type SidebarNode } from "@zag-js/shared"
import * as tree from "@zag-js/tree-view"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ChevronRightIcon, SearchIcon, XIcon } from "lucide-vue-next"
import styles from "@styles/sidebar.module.css"

const baseCollection = tree.collection<SidebarNode>({
  nodeToValue: (node) => node.id,
  nodeToString: (node) => node.name,
  rootNode: sidebarTree,
})

const filter = createFilter({ sensitivity: "base" })

// Mark a node as a keeper if it OR any ancestor matches; needed because `collection.filter`
// alone would prune children of a matched branch when the children don't themselves match.
function collectKeepSet(node: SidebarNode, query: string, ancestorMatched: boolean, keep: Set<string>): boolean {
  const selfMatched = ancestorMatched || filter.contains(node.name, query)
  let anyChildKept = false
  for (const child of node.children ?? []) {
    if (collectKeepSet(child, query, selfMatched, keep)) anyChildKept = true
  }
  if (selfMatched || anyChildKept) {
    keep.add(node.id)
    return true
  }
  return false
}

function getActiveValueFromPath(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length < 2) return null
  return `${segments[0]}/${segments[1]}`
}

function buildSearch(selected: string | null, expanded: string[]): string {
  const params = new URLSearchParams()
  if (selected) params.set("selected", selected)
  if (expanded.length) params.set("expanded", expanded.join(","))
  const out = params.toString()
  return out ? `?${out}` : ""
}

const route = useRoute()

const query = ref("")
const localExpanded = ref<string[] | null>(null)
const searchExpanded = ref<string[] | null>(null)

const activeValue = computed(() => {
  const fromParam = route.query.selected
  if (typeof fromParam === "string" && fromParam) return fromParam
  return getActiveValueFromPath(route.path)
})
const activeBranch = computed(() => activeValue.value?.split("/")[0])

const expandedRaw = computed(() => {
  const raw = route.query.expanded
  return typeof raw === "string" ? raw : null
})

const expandedFromUrl = computed<string[]>(() => {
  if (expandedRaw.value == null) return activeBranch.value ? [activeBranch.value] : []
  return expandedRaw.value ? expandedRaw.value.split(",").filter(Boolean) : []
})

const expandedKey = computed(() => expandedFromUrl.value.join("|"))
watch(expandedKey, () => {
  localExpanded.value = null
})

const expandedValue = computed(() => localExpanded.value ?? expandedFromUrl.value)

const collection = computed(() => {
  const trimmed = query.value.trim()
  if (!trimmed) return baseCollection
  const keep = new Set<string>()
  sidebarTree.children?.forEach((child) => collectKeepSet(child, trimmed, false, keep))
  return baseCollection.filter((node) => keep.has(node.id))
})

// Search expansion is local-only — searching shouldn't pollute the URL.
watch([query, collection], () => {
  if (!query.value.trim()) {
    searchExpanded.value = null
    return
  }
  searchExpanded.value = collection.value.getBranchValues()
})

const machineExpanded = computed(() => searchExpanded.value ?? expandedValue.value)

const id = useId()
const service = useMachine(tree.machine, () => ({
  id,
  collection: collection.value,
  selectedValue: activeValue.value ? [activeValue.value] : [],
  expandedValue: machineExpanded.value,
  onExpandedChange: (details) => {
    if (query.value.trim()) {
      searchExpanded.value = details.expandedValue
      return
    }
    localExpanded.value = details.expandedValue
  },
}))

const api = computed(() => tree.connect(service, normalizeProps))

function buildHref(node: SidebarNode) {
  const target = node.href ? node : node.children?.find((c) => c.href)
  if (!target?.href) return "#"
  const isBranch = !!node.children?.length
  const expanded = machineExpanded.value
  const next = isBranch && !expanded.includes(node.id) ? [...expanded, node.id] : expanded
  return `${target.href}${buildSearch(target.id, next)}`
}
</script>

<template>
  <aside :class="styles.sidebar">
    <header :class="styles.header">
      <strong>Zagjs</strong>
    </header>

    <div :class="styles.search">
      <SearchIcon :size="14" aria-hidden />
      <input v-model="query" type="search" placeholder="Find component" />
      <button v-if="query" type="button" :class="styles.clear" aria-label="Clear search" @click="query = ''">
        <XIcon :size="14" />
      </button>
    </div>

    <div v-bind="api.getRootProps()" :class="styles.tree">
      <div v-bind="api.getTreeProps()">
        <template v-if="collection.rootNode.children?.length">
          <SideNavNode
            v-for="(node, index) in collection.rootNode.children"
            :key="node.id"
            :node="node"
            :index-path="[index]"
            :api="api"
            :href="buildHref(node)"
          />
        </template>
        <p v-else :class="styles.empty">No matches</p>
      </div>
    </div>
  </aside>
</template>

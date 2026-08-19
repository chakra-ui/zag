<script setup lang="ts">
import { type SidebarNode } from "@zag-js/shared"
import * as tree from "@zag-js/tree-view"
import { ChevronRightIcon } from "lucide-vue-next"
import styles from "@styles/sidebar.module.css"

const props = defineProps<{
  node: SidebarNode
  indexPath: number[]
  api: tree.Api
  href: string
}>()

const nodeProps = computed(() => ({ indexPath: props.indexPath, node: props.node }))
const nodeState = computed(() => props.api.getNodeState(nodeProps.value))

function childHref(_child: SidebarNode) {
  // Inherit current expanded state plus the parent branch.
  const target = _child.href ? _child : _child.children?.find((c) => c.href)
  if (!target?.href) return "#"
  // Use the URL we already computed for our own row to derive expanded — but children share parent's prefix.
  const url = new URL(props.href, "http://localhost")
  const expandedRaw = url.searchParams.get("expanded")
  const expanded = expandedRaw ? expandedRaw.split(",").filter(Boolean) : []
  const isBranch = !!_child.children?.length
  const next = isBranch && !expanded.includes(_child.id) ? [...expanded, _child.id] : expanded
  const params = new URLSearchParams()
  params.set("selected", target.id)
  if (next.length) params.set("expanded", next.join(","))
  return `${target.href}?${params.toString()}`
}
</script>

<template>
  <div v-bind="api.getNodeGroupProps(nodeProps)">
    <NuxtLink :to="href" v-bind="api.getNodeProps(nodeProps)">
      <div v-bind="api.getNodeCellProps(nodeProps)">
        <span
          v-if="nodeState.isBranch"
          v-bind="api.getNodeIndicatorProps({ ...nodeProps, type: 'expanded' })"
          :class="styles.chevron"
        >
          <ChevronRightIcon :size="14" />
        </span>
        <span v-bind="api.getNodeTextProps(nodeProps)" :class="styles.label">
          {{ node.name }}
        </span>
      </div>
    </NuxtLink>
    <div v-if="nodeState.isBranch" v-bind="api.getNodeGroupContentProps(nodeProps)">
      <SideNavNode
        v-for="(child, index) in node.children"
        :key="child.id"
        :node="child"
        :index-path="[...indexPath, index]"
        :api="api"
        :href="childHref(child)"
      />
    </div>
  </div>
</template>

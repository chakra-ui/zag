<script setup lang="ts">
import type { GroupMeta } from "@zag-js/virtualizer"
import { useListVirtualizer } from "~/composables/useVirtualizer"

const ITEMS_PER_GROUP = 50
const GROUP_COUNT = 10
const HEADER_HEIGHT = 32
const ITEM_HEIGHT = 32
const TOTAL_ITEMS = GROUP_COUNT * ITEMS_PER_GROUP

const groups: GroupMeta[] = Array.from({ length: GROUP_COUNT }, (_, i) => ({
  id: `group-${i}`,
  startIndex: i * ITEMS_PER_GROUP,
  headerSize: HEADER_HEIGHT,
}))

const items = Array.from({ length: TOTAL_ITEMS }, (_, i) => {
  const groupIndex = Math.floor(i / ITEMS_PER_GROUP)
  const itemIndex = i % ITEMS_PER_GROUP
  return { id: `item-${i}`, label: `Item ${itemIndex + 1}`, group: `Group ${groupIndex + 1}`, groupIndex }
})

const COLORS = [
  "#fee2e2",
  "#ffedd5",
  "#fef9c3",
  "#dcfce7",
  "#d1fae5",
  "#dbeafe",
  "#e0e7ff",
  "#f3e8ff",
  "#fce7f3",
  "#f5f5f4",
]

const getGroupIndex = (index: number) => Math.floor(index / ITEMS_PER_GROUP)
const getGroupLabel = (index: number) => `Group ${index + 1}`
const isGroupStart = (index: number) => index % ITEMS_PER_GROUP === 0
const getItemSize = (index: number) => ITEM_HEIGHT + (isGroupStart(index) ? HEADER_HEIGHT : 0)

const scrollOffset = ref(0)

const { virtualizer, init } = useListVirtualizer(() => ({
  count: TOTAL_ITEMS,
  estimatedSize: getItemSize,
  groups,
  overscan: 5,
}))

const headerState = computed(() => virtualizer.getGroupHeaderState(scrollOffset.value, HEADER_HEIGHT))
const virtualItems = computed(() => virtualizer.getVirtualItems())

const onScroll = (event: Event) => {
  scrollOffset.value = (event.target as HTMLDivElement).scrollTop
  virtualizer.handleScroll(event)
}
</script>

<template>
  <main style="padding: 20px; max-width: 600px; width: 100%">
    <h1>Sticky Headers</h1>
    <p style="color: #64748b; font-size: 14px">
      {{ GROUP_COUNT }} groups, {{ ITEMS_PER_GROUP }} items each. Headers stick and push off on scroll.
    </p>

    <div style="position: relative; margin-top: 16px; width: 100%">
      <div
        v-if="headerState"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: `${HEADER_HEIGHT}px`,
          zIndex: 10,
          transform: `translateY(${headerState.translateY}px)`,
          backgroundColor: COLORS[getGroupIndex(headerState.group.startIndex)] || '#e2e8f0',
          borderBottom: '2px solid #94a3b8',
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          fontWeight: 700,
          fontSize: '13px',
          boxSizing: 'border-box',
        }"
      >
        {{ getGroupLabel(getGroupIndex(headerState.group.startIndex)) }}
      </div>

      <div
        :ref="(el) => init(el as HTMLElement)"
        tabindex="0"
        aria-label="Virtualized list with sticky group headers"
        style="height: 400px; overflow: auto; border: 2px solid #cbd5e1; border-radius: 8px"
        @scroll="onScroll"
      >
        <div :style="{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }">
          <div
            v-for="vi in virtualItems"
            :key="vi.index"
            :style="{
              ...virtualizer.getItemStyle(vi),
              height: `${vi.size}px`,
              backgroundColor: COLORS[items[vi.index]!.groupIndex],
              fontSize: '13px',
              boxSizing: 'border-box',
            }"
          >
            <div
              v-if="isGroupStart(vi.index)"
              :style="{
                height: `${HEADER_HEIGHT}px`,
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                fontWeight: 700,
                borderBottom: '2px solid #94a3b8',
                boxSizing: 'border-box',
              }"
            >
              {{ items[vi.index]!.group }}
            </div>
            <div
              :style="{
                height: `${ITEM_HEIGHT}px`,
                padding: '0 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #cbd5e1',
                boxSizing: 'border-box',
              }"
            >
              <span>{{ items[vi.index]!.label }}</span>
              <span style="color: #64748b; font-size: 11px">{{ items[vi.index]!.group }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p style="margin-top: 8px; font-size: 13px; color: #64748b">
      Rendered: {{ virtualItems.length }} of {{ TOTAL_ITEMS
      }}{{ headerState ? ` · ${getGroupLabel(getGroupIndex(headerState.group.startIndex))}` : "" }}
    </p>
  </main>
</template>

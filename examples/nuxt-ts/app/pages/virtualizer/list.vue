<script setup lang="ts">
import { useListVirtualizer } from "~/composables/useVirtualizer"

const estimateSize = () => 142

const generateItems = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    name: `Item ${i + 1}`,
    description: `This is the description for item ${i + 1}`,
  }))

const items = generateItems(10000)

const isSmooth = ref(true)

const { virtualizer, init } = useListVirtualizer(() => ({
  count: items.length,
  estimatedSize: estimateSize,
  overscan: 5,
  gap: 0,
  paddingStart: 0,
  paddingEnd: 0,
}))

const virtualItems = computed(() => virtualizer.getVirtualItems())
const totalSize = computed(() => virtualizer.getTotalSize())
</script>

<template>
  <main class="list-virtualizer">
    <div style="padding: 20px">
      <h1>List Virtualizer Example</h1>
      <p>Scrolling through {{ items.length.toLocaleString() }} items efficiently</p>

      <label style="display: flex; align-items: center; gap: 8px; margin-top: 12px; user-select: none">
        <input v-model="isSmooth" type="checkbox" />
        Smooth scroll
      </label>

      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px">
        <button type="button" @click="virtualizer.scrollToIndex(0, { smooth: isSmooth })">Scroll to Top</button>
        <button
          type="button"
          @click="virtualizer.scrollToIndex(Math.floor(items.length / 2), { align: 'center', smooth: isSmooth })"
        >
          Scroll to Middle
        </button>
        <button type="button" @click="virtualizer.scrollToIndex(items.length - 1, { smooth: isSmooth })">
          Scroll to Bottom
        </button>
      </div>

      <div
        :ref="(el) => init(el as HTMLElement)"
        v-bind="virtualizer.getContainerAriaAttrs()"
        tabindex="0"
        aria-label="Virtualized list"
        :style="{
          ...virtualizer.getContainerStyle(),
          height: '400px',
          border: '1px solid #ccc',
          marginTop: '16px',
        }"
        @scroll="virtualizer.handleScroll"
      >
        <div :style="{ height: `${totalSize}px`, width: '100%', position: 'relative' }">
          <div
            v-for="virtualItem in virtualItems"
            :key="virtualItem.index"
            :data-index="virtualItem.index"
            v-bind="virtualizer.getItemAriaAttrs(virtualItem.index)"
            :style="{
              ...virtualizer.getItemStyle(virtualItem),
              padding: '16px',
              backgroundColor: virtualItem.index % 2 === 0 ? '#f8f9fa' : '#ffffff',
              borderBottom: '1px solid #e1e5e9',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }"
          >
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: 600;
                font-size: 16px;
                color: #1a1a1a;
              "
            >
              {{ items[virtualItem.index]!.name }}
            </div>
            <p>{{ items[virtualItem.index]!.description }}</p>
            <div style="font-size: 12px; color: #9ca3af; font-family: monospace">
              Virtual Index: {{ virtualItem.index }} | Start: {{ virtualItem.start }}px | Size: {{ virtualItem.size }}px
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 16px; font-size: 14px; color: #6b7280">
        <div>Total items: {{ items.length.toLocaleString() }}</div>
        <div>Rendered items: {{ virtualItems.length }}</div>
        <div>Total height: {{ totalSize }}px</div>
        <div>
          Visible range: {{ virtualItems[0]?.index ?? 0 }} - {{ virtualItems[virtualItems.length - 1]?.index ?? 0 }}
        </div>
        <div v-if="virtualItems.length > 100" style="color: orange">⚠️ Many items rendered (fast scroll mode)</div>
        <div v-else style="color: green">✅ Virtualization working!</div>
      </div>
    </div>
  </main>
</template>

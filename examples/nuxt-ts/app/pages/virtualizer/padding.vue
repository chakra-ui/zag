<script setup lang="ts">
import { useListVirtualizer } from "~/composables/useVirtualizer"

const estimateSize = () => 40

const ITEM_COUNT = 1000

const items = Array.from({ length: ITEM_COUNT }, (_, i) => ({
  id: `item-${i}`,
  label: `Item ${i + 1}`,
}))

const paddingStart = ref(40)
const paddingEnd = ref(40)

const { virtualizer, init } = useListVirtualizer(() => ({
  count: ITEM_COUNT,
  estimatedSize: estimateSize,
  paddingStart: paddingStart.value,
  paddingEnd: paddingEnd.value,
  overscan: 5,
}))

const updatePadding = (start: number, end: number) => {
  paddingStart.value = start
  paddingEnd.value = end
}
</script>

<template>
  <main style="padding: 20px; max-width: 600px; width: 100%">
    <h1>Padding Example</h1>
    <p style="color: #64748b">
      <code>paddingStart</code> and <code>paddingEnd</code> add space before/after items. The blue regions show the
      padding areas.
    </p>

    <div style="display: flex; gap: 12px; margin-top: 16px; align-items: center">
      <label>
        paddingStart:
        <input
          type="number"
          :value="paddingStart"
          style="width: 60px"
          @input="updatePadding(Number(($event.target as HTMLInputElement).value), paddingEnd)"
        />px
      </label>
      <label>
        paddingEnd:
        <input
          type="number"
          :value="paddingEnd"
          style="width: 60px"
          @input="updatePadding(paddingStart, Number(($event.target as HTMLInputElement).value))"
        />px
      </label>
      <button @click="updatePadding(0, 0)">No padding</button>
      <button @click="updatePadding(80, 80)">Large padding</button>
    </div>

    <div
      :ref="(el) => init(el as HTMLElement)"
      tabindex="0"
      aria-label="Virtualized list with padding"
      style="
        height: 400px;
        width: 100%;
        overflow: auto;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        margin-top: 16px;
        box-sizing: border-box;
      "
      @scroll="virtualizer.handleScroll"
    >
      <div
        :style="{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
          background: `linear-gradient(to bottom, #dbeafe ${paddingStart}px, transparent ${paddingStart}px, transparent calc(100% - ${paddingEnd}px), #dbeafe calc(100% - ${paddingEnd}px))`,
        }"
      >
        <div
          v-for="vi in virtualizer.getVirtualItems()"
          :key="vi.index"
          :style="{
            ...virtualizer.getItemStyle(vi),
            height: '40px',
            padding: '0 16px',
            borderBottom: '1px solid #cbd5e1',
            boxSizing: 'border-box',
            backgroundColor: vi.index % 2 === 0 ? '#f8fafc' : '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }"
        >
          <span>{{ items[vi.index]!.label }}</span>
          <span style="color: #94a3b8; font-size: 12px">y: {{ vi.start }}px</span>
        </div>
      </div>
    </div>

    <p style="margin-top: 12px; font-size: 13px; color: #64748b">
      Total size: {{ virtualizer.getTotalSize() }}px (padding: {{ paddingStart }} + {{ paddingEnd }} =
      {{ paddingStart + paddingEnd }}px)
    </p>
  </main>
</template>

<script setup lang="ts">
import * as numberFlow from "@zag-js/number-flow"
import { normalizeProps, useMachine } from "@zag-js/vue"

const props = defineProps<{
  value?: number
  defaultValue?: number
  locale?: string
  formatOptions?: Intl.NumberFormatOptions
  trend?: numberFlow.Trend
}>()

const id = useId()

const service = useMachine(
  numberFlow.machine,
  computed(() => {
    // Drop unset props so machine defaults apply
    const defined = Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined))
    return { id, ...defined } as numberFlow.Props
  }),
)

const api = computed(() => numberFlow.connect(service, normalizeProps))
</script>

<template>
  <span v-bind="api.getRootProps()">
    <template v-for="segment in api.segments" :key="segment.key">
      <span v-if="segment.kind === 'digit'" v-bind="api.getDigitProps({ segment })">
        <span v-bind="api.getDigitTrackProps({ segment })">
          <span v-for="cell in api.digitCells" :key="cell.index" v-bind="api.getDigitCellProps({ segment, cell })">{{
            cell.glyph
          }}</span>
        </span>
      </span>
      <span v-else v-bind="api.getSymbolProps({ segment })">{{ segment.value }}</span>
    </template>
    <span v-bind="api.getValueTextProps()">{{ api.announcedValueText }}</span>
  </span>
</template>

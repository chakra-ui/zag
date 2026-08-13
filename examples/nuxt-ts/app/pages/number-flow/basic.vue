<script setup lang="ts">
import * as numberFlow from "@zag-js/number-flow"
import { numberFlowControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, ref, useId } from "vue"
import "@styles/number-flow.css"

const controls = useControls(numberFlowControls)

const animations = ref({ started: 0, completed: 0 })

const service = useMachine(
  numberFlow.machine,
  controls.mergeProps<numberFlow.Props>({
    id: useId(),
    defaultValue: 1234,
    onAnimationStart() {
      animations.value = { ...animations.value, started: animations.value.started + 1 }
    },
    onAnimationComplete() {
      animations.value = { ...animations.value, completed: animations.value.completed + 1 }
    },
  }),
)

const api = computed(() => numberFlow.connect(service, normalizeProps))

const randomDelta = () => Math.round(Math.random() * 900 + 1)
</script>

<template>
  <main class="number-flow">
    <div v-bind="api.getRootProps()">
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
    </div>

    <div class="number-flow__actions">
      <button @click="api.setValue(api.value - randomDelta())">Decrement</button>
      <button @click="api.setValue(api.value + randomDelta())">Increment</button>
      <button @click="api.setValue(Math.round(Math.random() * 99999))">Randomize</button>
      <button @click="api.setValue(0)">Reset</button>
      <span class="number-flow__value" data-testid="value">
        value: {{ api.value }} {{ api.animating ? "(rolling)" : "" }}
      </span>
      <span class="number-flow__value" data-testid="animations">
        animations: {{ animations.started }} started / {{ animations.completed }} completed
      </span>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

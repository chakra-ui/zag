<script setup lang="ts">
import * as drawer from "@zag-js/drawer"
import { drawerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import Presence from "~/components/Presence.vue"
import { ref } from "vue"
import styles from "../../../../shared/styles/drawer.module.css"

const controls = useControls(drawerControls)
const volume = ref(50)

const service = useMachine(
  drawer.machine,
  controls.mergeProps<drawer.Props>({
    id: useId(),
  }),
)

const api = computed(() => drawer.connect(service, normalizeProps))
</script>

<template>
  <main>
    <button v-bind="api.getTriggerProps()" :class="styles.trigger">Open</button>
    <Presence v-bind="api.getBackdropProps()" :class="styles.backdrop" />
    <div v-bind="api.getPositionerProps()" :class="styles.positioner">
      <Presence v-bind="api.getContentProps()" :class="styles.content">
        <div v-bind="api.getGrabberProps()" :class="styles.grabber">
          <div v-bind="api.getGrabberIndicatorProps()" :class="styles.grabberIndicator" />
        </div>
        <div v-bind="api.getTitleProps()">Drawer + native range</div>
        <p v-bind="api.getDescriptionProps()" style="padding: 0 16px; margin: 8px 0 0; font-size: 14px; color: #555">
          Drag the slider horizontally. The sheet should not move or steal the gesture while adjusting the range.
        </p>
        <div style="padding: 16px; width: 100%; box-sizing: border-box">
          <label for="drawer-range-demo" style="display: block; margin-bottom: 8px; font-size: 14px">
            Volume (native <code style="font-size: 12px">&lt;input type="range"&gt;</code>)
          </label>
          <input
            id="drawer-range-demo"
            v-model.number="volume"
            type="range"
            min="0"
            max="100"
            data-testid="drawer-native-range"
            style="width: 100%; touch-action: auto"
          />
          <output style="display: block; margin-top: 8px; font-size: 14px; font-variant-numeric: tabular-nums">
            {{ volume }}
          </output>
        </div>
        <div :class="styles.scrollable" data-testid="scrollable">
          <div v-for="(_element, index) in Array.from({ length: 40 })" :key="index" style="padding: 4px 16px">
            Item {{ index }}
          </div>
        </div>
      </Presence>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :context="['dragOffset', 'snapPoint', 'resolvedActiveSnapPoint']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>

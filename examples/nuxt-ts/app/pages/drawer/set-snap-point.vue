<script setup lang="ts">
import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/vue"
import Presence from "~/components/Presence.vue"
import styles from "@styles/drawer.module.css"

const log = ref<(string | number | null)[]>([])

const service = useMachine(drawer.machine, {
  id: useId(),
  snapPoints: ["20rem", "30rem", 1],
  defaultSnapPoint: "20rem",
  closeOnInteractOutside: false,
  onSnapPointChange(details) {
    log.value = [...log.value, details.snapPoint]
  },
})

const api = computed(() => drawer.connect(service, normalizeProps))

const setTwice = (a: string | number, b: string | number) => {
  api.value.setSnapPoint(a)
  api.value.setSnapPoint(b)
}

const setRepeatedly = () => {
  for (let i = 0; i < 5; i++) api.value.setSnapPoint("30rem")
}
</script>

<template>
  <main>
    <div data-testid="snap-point">{{ String(api.snapPoint) }}</div>
    <div data-testid="snap-point-log">{{ log.join(",") }}</div>
    <div data-testid="open-state">{{ String(api.open) }}</div>

    <button :class="styles.trigger" v-bind="api.getTriggerProps()">Open</button>

    <Presence :class="styles.backdrop" v-bind="api.getBackdropProps()" />
    <div :class="styles.positioner" v-bind="api.getPositionerProps()">
      <Presence :class="styles.content" v-bind="api.getContentProps()">
        <div :class="styles.grabber" v-bind="api.getGrabberProps()">
          <div :class="styles.grabberIndicator" v-bind="api.getGrabberIndicatorProps()" />
        </div>
        <div v-bind="api.getTitleProps()">Drawer</div>

        <button data-testid="reset" @click="log = []">Reset log</button>

        <button data-testid="set-30" @click="api.setSnapPoint('30rem')">setSnapPoint(30rem)</button>

        <button data-testid="set-30-then-20" @click="setTwice('30rem', '20rem')">
          setSnapPoint(30rem) then setSnapPoint(20rem)
        </button>

        <button data-testid="set-30-then-full" @click="setTwice('30rem', 1)">
          setSnapPoint(30rem) then setSnapPoint(1)
        </button>

        <button data-testid="set-30-repeatedly" @click="setRepeatedly">setSnapPoint(30rem) five times</button>
      </Presence>
    </div>
  </main>
</template>

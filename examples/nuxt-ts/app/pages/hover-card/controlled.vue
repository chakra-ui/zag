<script setup lang="ts">
import * as hoverCard from "@zag-js/hover-card"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/hover-card.css"

const open = ref(false)
const log = ref<string[]>([])

const id = useId()
const service = useMachine(
  hoverCard.machine,
  computed(() => ({
    id,
    open: open.value,
    onOpenChange: (details: hoverCard.OpenChangeDetails) => {
      open.value = details.open
      log.value = [...log.value, `${details.open ? "open" : "close"}:${details.reason ?? "-"}`]
    },
  })),
)

const api = computed(() => hoverCard.connect(service, normalizeProps))
</script>

<template>
  <div style="padding: 40px; height: 200vh">
    <h1>HoverCard Controlled</h1>
    <h1>{{ String(open) }}</h1>
    <div data-testid="reason-log">{{ log.join(" ") }}</div>
    <button type="button" data-testid="clear-log" @click="log = []">Clear log</button>

    <div style="display: flex; gap: 12px; margin-bottom: 24px">
      <button type="button" @click="open = true">Open</button>
      <button type="button" @click="open = false">Close</button>
    </div>

    <main class="hover-card">
      <div style="display: flex; gap: 50px">
        <a href="https://twitter.com/zag_js" target="_blank" v-bind="api.getTriggerProps()">Twitter</a>

        <Teleport v-if="api.open" to="#teleports">
          <div v-bind="api.getPositionerProps()">
            <div v-bind="api.getContentProps()">
              <div v-bind="api.getArrowProps()">
                <div v-bind="api.getArrowTipProps()" />
              </div>
              Twitter Preview
              <a href="https://twitter.com/zag_js" target="_blank">Twitter</a>
            </div>
          </div>
        </Teleport>
      </div>
    </main>
  </div>
</template>

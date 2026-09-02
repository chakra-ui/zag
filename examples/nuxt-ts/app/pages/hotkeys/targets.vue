<script setup lang="ts">
import { createHotkeyStore } from "@zag-js/hotkeys"

const store = createHotkeyStore()

const gridRef = ref<HTMLDivElement>()
const hostRef = ref<HTMLDivElement>()

const globalCount = ref(0)
const scopedCount = ref(0)
const arrowCount = ref(0)
const shadowCount = ref(0)
const seqCount = ref(0)
const pressedKeys = ref("")
const shiftSeen = ref(false)

let unsub: VoidFunction | undefined

onMounted(() => {
  const host = hostRef.value!
  if (!host.shadowRoot) {
    const shadow = host.attachShadow({ mode: "open" })
    const btn = document.createElement("button")
    btn.textContent = "shadow button (focus me, then press ctrl+m)"
    btn.id = "shadow-btn"
    shadow.appendChild(btn)
  }

  store.register([
    { id: "global.k", hotkey: "ctrl+k", action: () => (globalCount.value += 1) },
    {
      id: "scoped.k",
      hotkey: "ctrl+k",
      action: () => (scopedCount.value += 1),
      options: { target: () => gridRef.value ?? null },
    },
    {
      id: "grid.down",
      hotkey: "ArrowDown",
      action: () => (arrowCount.value += 1),
      options: { target: () => gridRef.value ?? null },
    },
    {
      id: "shadow.m",
      hotkey: "ctrl+m",
      action: () => (shadowCount.value += 1),
      options: { target: () => hostRef.value ?? null },
    },
    { id: "seq.gh", hotkey: "g > h", action: () => (seqCount.value += 1) },
  ])

  unsub = store.subscribe(
    (state) => [...state.pressedKeys].join("+"),
    (keys) => {
      if (keys) pressedKeys.value = keys
      if (store.isPressed("shift")) shiftSeen.value = true
    },
  )

  store.init({ target: document })
})

onBeforeUnmount(() => {
  unsub?.()
  store.destroy()
})
</script>

<template>
  <main style="padding: 2rem; max-width: 42rem; margin: 0 auto">
    <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem">Hotkey Targets</h1>

    <button data-testid="outside">outside button</button>

    <div
      ref="gridRef"
      tabindex="0"
      data-testid="grid"
      style="border: 2px solid #999; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0"
    >
      grid — focus me, then press <code>ctrl+k</code> or <code>ArrowDown</code>
    </div>

    <div
      ref="hostRef"
      data-testid="shadow-host"
      style="border: 2px solid #999; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem"
    ></div>

    <dl style="font-family: monospace">
      <dt>global ctrl+k</dt>
      <dd data-testid="global-count">{{ globalCount }}</dd>
      <dt>scoped ctrl+k (grid)</dt>
      <dd data-testid="scoped-count">{{ scopedCount }}</dd>
      <dt>ArrowDown (grid)</dt>
      <dd data-testid="arrow-count">{{ arrowCount }}</dd>
      <dt>ctrl+m (shadow host)</dt>
      <dd data-testid="shadow-count">{{ shadowCount }}</dd>
      <dt>sequence g then h</dt>
      <dd data-testid="seq-count">{{ seqCount }}</dd>
      <dt>last pressed keys</dt>
      <dd data-testid="pressed-keys">{{ pressedKeys || "-" }}</dd>
      <dt>isPressed("shift") observed</dt>
      <dd data-testid="shift-seen">{{ String(shiftSeen) }}</dd>
    </dl>
  </main>
</template>

<script lang="ts">
  import { createHotkeyStore } from "@zag-js/hotkeys"
  import { onMount } from "svelte"

  const store = createHotkeyStore()

  let gridEl: HTMLDivElement | undefined
  let hostEl: HTMLDivElement | undefined

  let globalCount = $state(0)
  let scopedCount = $state(0)
  let arrowCount = $state(0)
  let shadowCount = $state(0)
  let seqCount = $state(0)
  let pressedKeys = $state("")
  let shiftSeen = $state(false)

  onMount(() => {
    const host = hostEl!
    if (!host.shadowRoot) {
      const shadow = host.attachShadow({ mode: "open" })
      const btn = document.createElement("button")
      btn.textContent = "shadow button (focus me, then press ctrl+m)"
      btn.id = "shadow-btn"
      shadow.appendChild(btn)
    }

    store.register([
      { id: "global.k", hotkey: "ctrl+k", action: () => (globalCount += 1) },
      {
        id: "scoped.k",
        hotkey: "ctrl+k",
        action: () => (scopedCount += 1),
        options: { target: () => gridEl ?? null },
      },
      {
        id: "grid.down",
        hotkey: "ArrowDown",
        action: () => (arrowCount += 1),
        options: { target: () => gridEl ?? null },
      },
      {
        id: "shadow.m",
        hotkey: "ctrl+m",
        action: () => (shadowCount += 1),
        options: { target: () => hostEl ?? null },
      },
      { id: "seq.gh", hotkey: "g > h", action: () => (seqCount += 1) },
    ])

    const unsub = store.subscribe(
      (state) => [...state.pressedKeys].join("+"),
      (keys) => {
        if (keys) pressedKeys = keys
        if (store.isPressed("shift")) shiftSeen = true
      },
    )

    store.init({ target: document })

    return () => {
      unsub()
      store.destroy()
    }
  })
</script>

<main style="padding: 2rem; max-width: 42rem; margin: 0 auto">
  <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem">Hotkey Targets</h1>

  <button data-testid="outside">outside button</button>

  <div
    bind:this={gridEl}
    tabindex="0"
    role="grid"
    data-testid="grid"
    style="border: 2px solid #999; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0"
  >
    grid — focus me, then press <code>ctrl+k</code> or <code>ArrowDown</code>
  </div>

  <div
    bind:this={hostEl}
    data-testid="shadow-host"
    style="border: 2px solid #999; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem"
  ></div>

  <dl style="font-family: monospace">
    <dt>global ctrl+k</dt>
    <dd data-testid="global-count">{globalCount}</dd>
    <dt>scoped ctrl+k (grid)</dt>
    <dd data-testid="scoped-count">{scopedCount}</dd>
    <dt>ArrowDown (grid)</dt>
    <dd data-testid="arrow-count">{arrowCount}</dd>
    <dt>ctrl+m (shadow host)</dt>
    <dd data-testid="shadow-count">{shadowCount}</dd>
    <dt>sequence g then h</dt>
    <dd data-testid="seq-count">{seqCount}</dd>
    <dt>last pressed keys</dt>
    <dd data-testid="pressed-keys">{pressedKeys || "-"}</dd>
    <dt>isPressed("shift") observed</dt>
    <dd data-testid="shift-seen">{String(shiftSeen)}</dd>
  </dl>
</main>

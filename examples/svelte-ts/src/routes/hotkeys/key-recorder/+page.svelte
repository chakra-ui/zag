<script module lang="ts">
  import {
    createHotkeyRecorder,
    formatHotkey,
    isHotkeyEqual,
    type HotkeyRecorder,
    type RecordedHotkey,
  } from "@zag-js/hotkeys"

  interface ShortcutBinding {
    id: string
    label: string
    hotkey: RecordedHotkey | null
  }

  function makeBinding(id: string, label: string, hotkey?: string): ShortcutBinding {
    return {
      id,
      label,
      hotkey: hotkey ? { value: hotkey, display: formatHotkey(hotkey, { platform: "mac" }) } : null,
    }
  }

  const kbdBtnStyle =
    "padding: 4px 10px; font-size: 0.8rem; font-family: monospace; background-color: #fff; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 1px 0 #eee; cursor: pointer; min-width: 80px; text-align: center"

  const smallBtnStyle =
    "padding: 3px 8px; font-size: 0.75rem; background-color: transparent; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; color: #888"
</script>

<script lang="ts">
  let bindings = $state<ShortcutBinding[]>([
    makeBinding("save", "Save", "mod+S"),
    makeBinding("undo", "Undo", "mod+Z"),
    makeBinding("redo", "Redo"),
    makeBinding("search", "Search"),
    makeBinding("palette", "Command Palette"),
  ])
  let editingId = $state<string | null>(null)
  let conflict = $state<string | null>(null)

  let recorder: HotkeyRecorder | null = null

  $effect(() => {
    recorder = createHotkeyRecorder({
      target: document,
      onRecord(hotkey) {
        const existing = bindings.find(
          (b) => b.id !== editingId && b.hotkey && isHotkeyEqual(b.hotkey.value, hotkey.value),
        )
        if (existing) {
          conflict = `"${hotkey.display}" is already used by ${existing.label}`
          recorder?.start()
          return
        }
        conflict = null
        bindings = bindings.map((b) => (b.id === editingId ? { ...b, hotkey } : b))
        editingId = null
      },
      onCancel() {
        conflict = null
        editingId = null
      },
    })
    return () => recorder?.destroy()
  })
</script>

<main style="padding: 2rem; max-width: 42rem; margin: 0 auto">
  <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem">Key Recorder</h1>
  <p style="color: #666; margin-bottom: 1.5rem">Click a shortcut to record a new key combination.</p>

  <div style="display: flex; flex-direction: column; gap: 2px">
    {#each bindings as binding (binding.id)}
      {@const isEditing = editingId === binding.id}
      <div
        style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: 6px"
        style:background-color={isEditing ? "#fff7ed" : "#fafafa"}
        style:border={isEditing ? "1px solid #f97316" : "1px solid transparent"}
      >
        <span style="font-size: 0.9rem; font-weight: 500">{binding.label}</span>

        <div style="display: flex; align-items: center; gap: 8px">
          {#if isEditing}
            <span style="font-size: 0.8rem; font-style: italic" style:color={conflict ? "#ef4444" : "#f97316"}>
              {conflict || "Press a key combo..."}
            </span>
            <button onclick={() => recorder?.cancel()} style={smallBtnStyle}>Cancel</button>
          {:else}
            <button
              onclick={() => {
                conflict = null
                editingId = binding.id
                recorder?.start()
              }}
              style={kbdBtnStyle}
              style:color={binding.hotkey ? "#333" : "#999"}
            >
              {binding.hotkey?.display || "Unset"}
            </button>
            {#if binding.hotkey}
              <button
                onclick={() => {
                  bindings = bindings.map((b) => (b.id === binding.id ? { ...b, hotkey: null } : b))
                }}
                style={smallBtnStyle}
              >
                Clear
              </button>
            {/if}
          {/if}
        </div>
      </div>
    {/each}
  </div>

  <div style="margin-top: 2rem; padding: 1rem; background-color: #f5f5f5; border-radius: 8px">
    <h3 style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: #666">Current Bindings</h3>
    <pre style="font-size: 0.8rem; margin: 0; overflow: auto">{JSON.stringify(
        bindings.map((b) => ({ id: b.id, hotkey: b.hotkey?.value ?? null })),
        null,
        2,
      )}</pre>
  </div>
</main>

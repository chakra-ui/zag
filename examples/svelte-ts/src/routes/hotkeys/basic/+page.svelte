<script module lang="ts">
  import { createHotkeyStore, formatHotkey, type HotkeyCommand } from "@zag-js/hotkeys"

  const store = createHotkeyStore()
</script>

<script lang="ts">
  let logs = $state<string[]>([])
  let commands = $state<HotkeyCommand[]>([])

  const addLog = (message: string) => {
    logs = [`${new Date().toLocaleTimeString()}: ${message}`, ...logs.slice(0, 9)]
  }

  $effect(() => {
    store.register([
      {
        id: "save",
        hotkey: "mod+S",
        label: "Save",
        action: () => addLog("mod+S: Save"),
        options: { preventDefault: true },
      },
      { id: "undo", hotkey: "mod+Z", label: "Undo", action: () => addLog("mod+Z: Undo") },
      { id: "redo", hotkey: "mod+shift+Z", label: "Redo", action: () => addLog("mod+shift+Z: Redo") },
      { id: "escape", hotkey: "Escape", label: "Close", action: () => addLog("Escape: Close") },
    ])

    store.init({ target: document })
    commands = Array.from(store.getState().commands.values())

    return () => store.destroy()
  })
</script>

<main style="padding: 2rem; max-width: 42rem; margin: 0 auto">
  <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1.5rem">Hotkeys Example</h1>

  <div style="margin-bottom: 1.5rem; padding: 1rem; background-color: #f5f5f5; border-radius: 0.5rem">
    <ul style="margin: 0.5rem 0; padding-left: 1.5rem">
      {#each commands as cmd (cmd.id)}
        <li>
          <code>{formatHotkey(cmd.hotkey, { platform: "mac" })}</code> : {cmd.label || cmd.id}
        </li>
      {/each}
    </ul>
  </div>

  <div style="background-color: #000; color: #00ff00; padding: 1rem; border-radius: 0.5rem; font-family: monospace">
    <div style="margin-bottom: 0.5rem; color: #888">Event Log:</div>
    {#each logs as log, i (i)}
      <div style="font-size: 0.8rem">{log}</div>
    {/each}
    {#if logs.length === 0}
      <div style="color: #666; font-style: italic">Press any hotkey to see events...</div>
    {/if}
  </div>
</main>

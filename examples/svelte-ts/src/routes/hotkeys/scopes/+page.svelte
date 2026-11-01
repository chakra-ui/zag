<script module lang="ts">
  import { createHotkeyStore } from "@zag-js/hotkeys"

  const store = createHotkeyStore({
    activeScopes: ["editor"],
    conflictBehavior: "allow",
  })

  const kbdStyle =
    "display: inline-block; padding: 2px 6px; font-size: 0.8rem; font-family: monospace; background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0 1px 0 #ccc"
</script>

<script lang="ts">
  import type { Snippet } from "svelte"

  let activePanel = $state<"editor" | "terminal">("editor")
  let editorLogs = $state<string[]>([])
  let terminalLogs = $state<string[]>([])

  const logTo = (target: "editor" | "terminal", message: string) => {
    const entry = `${new Date().toLocaleTimeString()}: ${message}`
    if (target === "editor") {
      editorLogs = [entry, ...editorLogs.slice(0, 4)]
    } else {
      terminalLogs = [entry, ...terminalLogs.slice(0, 4)]
    }
  }

  $effect(() => {
    store.register([
      // Same hotkey, different scopes
      {
        id: "editor-run",
        hotkey: "mod+Enter",
        label: "Run",
        action: () => logTo("editor", "Run code in editor"),
        scopes: ["editor"],
      },
      {
        id: "terminal-run",
        hotkey: "mod+Enter",
        label: "Run",
        action: () => logTo("terminal", "Execute command in terminal"),
        scopes: ["terminal"],
      },

      // Scope-specific shortcuts
      {
        id: "editor-format",
        hotkey: "Alt+Shift+F",
        label: "Format",
        action: () => logTo("editor", "Format code"),
        scopes: ["editor"],
      },
      {
        id: "terminal-clear",
        hotkey: "mod+K",
        label: "Clear",
        action: () => {
          terminalLogs = []
          logTo("terminal", "Terminal cleared")
        },
        scopes: ["terminal"],
      },
    ])

    store.init({ target: document })

    return () => store.destroy()
  })

  const switchPanel = (panel: "editor" | "terminal") => {
    activePanel = panel
    store.setScope(panel)
  }
</script>

{#snippet tab(active: boolean, onClick: () => void, children: Snippet)}
  <button
    onclick={onClick}
    style="padding: 6px 16px; font-size: 0.8rem; border: none; border-radius: 6px 6px 0 0; cursor: pointer"
    style:font-weight={active ? 600 : 400}
    style:background-color={active ? "#1e1e1e" : "#e5e5e5"}
    style:color={active ? "#fff" : "#666"}
  >
    {@render children()}
  </button>
{/snippet}

{#snippet panel(active: boolean, hints: string[], logs: string[], onClick: () => void)}
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div
    onclick={onClick}
    style="flex: 1; padding: 12px; border-radius: 0 0 6px 6px; font-family: monospace; font-size: 0.8rem; cursor: pointer; transition: all 0.15s"
    style:background-color={active ? "#1e1e1e" : "#f5f5f5"}
    style:color={active ? "#d4d4d4" : "#999"}
    style:border={active ? "1px solid #333" : "1px solid #ddd"}
  >
    <div style="margin-bottom: 8px" style:color={active ? "#888" : "#bbb"}>
      {#each hints as h, i (i)}
        <div>{h}</div>
      {/each}
    </div>
    {#each logs as log, i (i)}
      <div style:color={active ? "#00ff00" : "#aaa"}>{log}</div>
    {/each}
    {#if logs.length === 0}
      <div style="font-style: italic; color: #666">No events yet...</div>
    {/if}
  </div>
{/snippet}

{#snippet editorLabel()}Editor{/snippet}
{#snippet terminalLabel()}Terminal{/snippet}

<main style="padding: 2rem; max-width: 42rem; margin: 0 auto">
  <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem">Hotkey Scopes</h1>
  <p style="color: #666; margin-bottom: 1rem">
    <kbd style={kbdStyle}>⌘ Enter</kbd> does different things depending on which panel is focused.
  </p>

  <div style="display: flex; gap: 2px; margin-bottom: 2px">
    {@render tab(activePanel === "editor", () => switchPanel("editor"), editorLabel)}
    {@render tab(activePanel === "terminal", () => switchPanel("terminal"), terminalLabel)}
  </div>

  <div style="display: flex; gap: 2px; min-height: 220px">
    {@render panel(activePanel === "editor", ["⌘Enter — Run code", "Alt+Shift+F — Format"], editorLogs, () =>
      switchPanel("editor"),
    )}
    {@render panel(activePanel === "terminal", ["⌘Enter — Execute command", "⌘K — Clear"], terminalLogs, () =>
      switchPanel("terminal"),
    )}
  </div>

  <div style="margin-top: 1rem; font-size: 0.8rem; color: #888">
    Active scope: <strong style="color: #333">{activePanel}</strong>
  </div>
</main>

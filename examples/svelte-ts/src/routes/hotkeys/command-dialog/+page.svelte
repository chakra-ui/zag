<script module lang="ts">
  import { createHotkeyStore } from "@zag-js/hotkeys"

  let openDialog: () => void = () => {}

  const store = createHotkeyStore()

  store.register([
    {
      id: "open-command-dialog",
      hotkey: "mod+K",
      label: "Open Command Dialog",
      description: "Open the command dialog",
      action: () => openDialog(),
      options: { preventDefault: true },
    },
    {
      id: "open-command-dialog-slash",
      hotkey: "mod+/",
      label: "Open Command Dialog (slash)",
      description: "Open the command dialog with slash",
      action: () => openDialog(),
      options: { preventDefault: true },
    },
  ])

  const commands = [
    { id: "new-file", label: "New File", category: "File" },
    { id: "open-file", label: "Open File", category: "File" },
    { id: "save-file", label: "Save File", category: "File" },
    { id: "toggle-sidebar", label: "Toggle Sidebar", category: "View" },
    { id: "toggle-terminal", label: "Toggle Terminal", category: "View" },
    { id: "zoom-in", label: "Zoom In", category: "View" },
    { id: "zoom-out", label: "Zoom Out", category: "View" },
    { id: "find-replace", label: "Find and Replace", category: "Edit" },
    { id: "format-document", label: "Format Document", category: "Edit" },
    { id: "go-to-line", label: "Go to Line", category: "Edit" },
    { id: "git-commit", label: "Git: Commit", category: "Git" },
    { id: "git-push", label: "Git: Push", category: "Git" },
    { id: "git-pull", label: "Git: Pull", category: "Git" },
  ]

  const kbdStyle =
    "display: inline-block; padding: 2px 6px; font-size: 0.8rem; font-family: monospace; background-color: #f0f0f0; border: 1px solid #ccc; border-radius: 4px; box-shadow: 0 1px 0 #ccc"

  const inputStyle =
    "width: 100%; padding: 14px 16px; font-size: 1rem; border: none; border-bottom: 1px solid #eee; outline: none; box-sizing: border-box"

  const listStyle = "max-height: 320px; overflow-y: auto; padding: 8px 0"

  const categoryStyle =
    "padding: 8px 16px 4px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #999"

  const itemStyle = "padding: 8px 16px; font-size: 0.9rem; cursor: pointer; color: #333"

  const emptyStyle = "padding: 24px 16px; text-align: center; color: #999; font-size: 0.9rem"
</script>

<script lang="ts">
  import * as dialog from "@zag-js/dialog"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Portal from "$lib/components/portal.svelte"
  import Presence from "$lib/components/presence.svelte"
  import "@styles/dialog.css"

  let open = $state(false)
  let query = $state("")
  let inputRef = $state<HTMLInputElement>()

  const service = useMachine(dialog.machine, () => ({
    id: "command-dialog",
    open,
    onOpenChange(details) {
      open = details.open
    },
  }))
  const api = $derived(dialog.connect(service, normalizeProps))

  const filtered = $derived(commands.filter((cmd) => cmd.label.toLowerCase().includes(query.toLowerCase())))

  const grouped = $derived(
    filtered.reduce(
      (acc, cmd) => {
        ;(acc[cmd.category] ??= []).push(cmd)
        return acc
      },
      {} as Record<string, typeof commands>,
    ),
  )

  $effect(() => {
    openDialog = () => (open = true)

    store.init({
      target: document,
    })

    return () => {
      store.destroy()
    }
  })

  $effect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef?.focus())
    } else {
      query = ""
    }
  })
</script>

<main style="padding: 2rem; max-width: 42rem; margin: 0 auto">
  <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem">Command Dialog</h1>
  <p style="color: #666; margin-bottom: 1.5rem">
    Press <kbd style={kbdStyle}>⌘K</kbd> or <kbd style={kbdStyle}>⌘/</kbd> to open.
  </p>

  <Portal>
    <Presence {...api.getBackdropProps()} />
    <div {...api.getPositionerProps()}>
      <Presence {...api.getContentProps()}>
        <h2 {...api.getTitleProps()} style="display: none">Command Palette</h2>

        <input bind:this={inputRef} type="text" bind:value={query} placeholder="Type a command..." style={inputStyle} />

        <div style={listStyle}>
          {#each Object.entries(grouped) as [category, items] (category)}
            <div>
              <div style={categoryStyle}>{category}</div>
              {#each items as cmd (cmd.id)}
                <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
                <div
                  style={itemStyle}
                  onclick={() => {
                    open = false
                    console.log(`Executed: ${cmd.label}`)
                  }}
                >
                  {cmd.label}
                </div>
              {/each}
            </div>
          {/each}

          {#if filtered.length === 0}
            <div style={emptyStyle}>No results found.</div>
          {/if}
        </div>
      </Presence>
    </div>
  </Portal>
</main>

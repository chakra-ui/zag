import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { Presence } from "~/components/presence"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"

interface User {
  id: number
  name: string
  email: string
  role: string
}

const users: User[] = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Admin" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "Editor" },
  { id: 3, name: "Carol Davis", email: "carol@example.com", role: "Viewer" },
  { id: 4, name: "David Wilson", email: "david@example.com", role: "Editor" },
  { id: 5, name: "Eve Martinez", email: "eve@example.com", role: "Admin" },
]

export default function DialogMultipleTriggerControlled() {
  const [activeTrigger, setActiveTrigger] = createSignal<string | null>(null)
  const [open, setOpen] = createSignal(false)

  const activeUser = createMemo(() => users.find((u) => `${u.id}` === activeTrigger()) ?? null)

  const id = createUniqueId()
  const service = useMachine(dialog.machine, () => ({
    id,
    open: open(),
    onOpenChange(details) {
      setOpen(details.open)
    },
    triggerValue: activeTrigger(),
    onTriggerValueChange(details) {
      setActiveTrigger(details.value)
    },
  }))

  const api = createMemo(() => dialog.connect(service, normalizeProps))

  return (
    <>
      <main style={{ padding: "40px", "font-family": "system-ui" }}>
        <section style={{ "margin-bottom": "40px" }}>
          <h2>Controlled Mode - User Table</h2>

          <table style={{ width: "100%", "border-collapse": "collapse", "margin-top": "20px" }}>
            <thead>
              <tr style={{ "background-color": "#f3f4f6", "text-align": "left" }}>
                <th style={{ padding: "12px", "border-bottom": "2px solid #e5e7eb" }}>Name</th>
                <th style={{ padding: "12px", "border-bottom": "2px solid #e5e7eb" }}>Email</th>
                <th style={{ padding: "12px", "border-bottom": "2px solid #e5e7eb" }}>Role</th>
                <th style={{ padding: "12px", "border-bottom": "2px solid #e5e7eb" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <For each={users}>
                {(user) => (
                  <tr style={{ "border-bottom": "1px solid #e5e7eb" }}>
                    <td style={{ padding: "12px" }}>{user.name}</td>
                    <td style={{ padding: "12px" }}>{user.email}</td>
                    <td style={{ padding: "12px" }}>{user.role}</td>
                    <td style={{ padding: "12px", display: "flex", gap: "8px" }}>
                      <button {...api().getTriggerProps({ value: `${user.id}` })}>Edit</button>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>

          <div style={{ "margin-top": "20px", padding: "12px", background: "#f3f4f6", "border-radius": "6px" }}>
            <strong>api.open:</strong> {String(api().open)}
            <br />
            <strong>local open:</strong> {String(open())} <br />
            <hr />
            <strong>api.triggerValue:</strong> {api().triggerValue || "-"} <br />
            <strong>local activeTrigger:</strong> {activeTrigger() || "-"} <br />
            <hr />
            <strong>activeUser:</strong> {activeUser() ? `${activeUser()!.name} (${activeUser()!.email})` : "-"}
          </div>
        </section>

        <Portal>
          <div {...api().getBackdropProps()} />
          <div {...api().getPositionerProps()}>
            <Presence {...api().getContentProps()}>
              <Show when={activeUser()} fallback={<div>No user selected</div>}>
                <h2 {...api().getTitleProps()}>Edit User</h2>
                <p {...api().getDescriptionProps()}>Update information for {activeUser()!.name}</p>
                <div style={{ "margin-bottom": "20px" }}>
                  <div style={{ "margin-bottom": "12px" }}>
                    <label>Name</label>
                    <input type="text" value={activeUser()!.name} style={{ display: "block", width: "100%" }} />
                  </div>
                  <div style={{ "margin-bottom": "12px" }}>
                    <label>Email</label>
                    <input type="email" value={activeUser()!.email} style={{ display: "block", width: "100%" }} />
                  </div>
                  <div style={{ "margin-bottom": "12px" }}>
                    <label>Role</label>
                    <select value={activeUser()!.role} style={{ display: "block", width: "100%" }}>
                      <option value="Admin">Admin</option>
                      <option value="Editor">Editor</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>
                </div>
                <button {...api().getCloseTriggerProps()}>Close</button>
              </Show>
            </Presence>
          </div>
        </Portal>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} context={["triggerValue"]} />
      </Toolbar>
    </>
  )
}

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

export default function DialogMultipleTrigger() {
  const [activeUser, setActiveUser] = createSignal<User | null>(null)

  const service = useMachine(dialog.machine, {
    id: createUniqueId(),
    onTriggerValueChange({ value }) {
      const user = users.find((u) => `${u.id}` === value) ?? null
      setActiveUser(user)
    },
  })

  const api = createMemo(() => dialog.connect(service, normalizeProps))

  return (
    <>
      <main style={{ padding: "40px", "font-family": "system-ui" }}>
        <section style={{ "margin-bottom": "40px" }}>
          <h2>User Management Table</h2>

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

          <div
            style={{
              "margin-top": "20px",
              padding: "12px",
              "background-color": "#f9fafb",
              "border-radius": "6px",
            }}
          >
            <strong>Active Trigger:</strong> {api().triggerValue || "-"} <br />
            <strong>Active User:</strong> {activeUser() ? `${activeUser()!.name} (${activeUser()!.email})` : "-"}
          </div>
        </section>

        <Show when={api().open}>
          <Portal>
            <Presence {...api().getBackdropProps()} />
            <div {...api().getPositionerProps()}>
              <Presence {...api().getContentProps()}>
                {activeUser() ? (
                  <>
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
                    <div style={{ display: "flex", gap: "10px", "justify-content": "flex-end" }}>
                      <button {...api().getCloseTriggerProps()}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      </button>
                      <button>Save Changes</button>
                    </div>
                  </>
                ) : (
                  <div>No user selected</div>
                )}
              </Presence>
            </div>
          </Portal>
        </Show>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} context={["triggerValue"]} />
      </Toolbar>
    </>
  )
}

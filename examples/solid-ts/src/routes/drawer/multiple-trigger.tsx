import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import { Presence } from "../../components/presence"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import styles from "../../../../shared/styles/drawer.module.css"

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

export default function Page() {
  const [activeUser, setActiveUser] = createSignal<User | null>(null)

  const service = useMachine(drawer.machine, {
    id: createUniqueId(),
    onTriggerValueChange({ value }) {
      setActiveUser(users.find((u) => `${u.id}` === value) ?? null)
    },
  })

  const api = createMemo(() => drawer.connect(service, normalizeProps))

  return (
    <>
      <main>
        <h2>User Management - Drawer with Multiple Triggers</h2>

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
                  <td style={{ padding: "12px" }}>
                    <button {...api().getTriggerProps({ value: `${user.id}` })}>Edit</button>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>

        <div style={{ "margin-top": "20px", padding: "12px", "background-color": "#f9fafb", "border-radius": "6px" }}>
          <strong>Active Trigger:</strong> {api().triggerValue || "-"} <br />
          <strong>Active User:</strong> {activeUser() ? `${activeUser()!.name} (${activeUser()!.email})` : "-"}
        </div>

        <Presence class={styles.backdrop} {...api().getBackdropProps()} />
        <div class={styles.positioner} {...api().getPositionerProps()}>
          <Presence class={styles.content} {...api().getContentProps()}>
            <div class={styles.grabber} {...api().getGrabberProps()}>
              <div class={styles.grabberIndicator} {...api().getGrabberIndicatorProps()} />
            </div>
            {activeUser() ? (
              <>
                <div {...api().getTitleProps()}>Edit {activeUser()!.name}</div>
                <div style={{ padding: "16px" }}>
                  <div style={{ "margin-bottom": "12px" }}>
                    <label>Name</label>
                    <input type="text" value={activeUser()!.name} style={{ display: "block", width: "100%" }} />
                  </div>
                  <div style={{ "margin-bottom": "12px" }}>
                    <label>Email</label>
                    <input type="email" value={activeUser()!.email} style={{ display: "block", width: "100%" }} />
                  </div>
                  <button {...api().getCloseTriggerProps()}>Close</button>
                </div>
              </>
            ) : (
              <div style={{ padding: "16px" }}>No user selected</div>
            )}
          </Presence>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} context={["triggerValue", "snapPoint"]} />
      </Toolbar>
    </>
  )
}

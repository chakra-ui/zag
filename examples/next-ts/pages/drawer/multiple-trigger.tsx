import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { Presence } from "../../components/presence"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import styles from "../../../shared/styles/drawer.module.css"

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
  const [activeUser, setActiveUser] = useState<User | null>(null)

  const service = useMachine(drawer.machine, {
    id: useId(),
    swipeDirection: "end",
    onTriggerValueChange({ value }) {
      setActiveUser(users.find((u) => `${u.id}` === value) ?? null)
    },
  })

  const api = drawer.connect(service, normalizeProps)

  return (
    <>
      <main>
        <h2>User Management - Drawer with Multiple Triggers</h2>

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6", textAlign: "left" }}>
              <th style={{ padding: "12px", borderBottom: "2px solid #e5e7eb" }}>Name</th>
              <th style={{ padding: "12px", borderBottom: "2px solid #e5e7eb" }}>Email</th>
              <th style={{ padding: "12px", borderBottom: "2px solid #e5e7eb" }}>Role</th>
              <th style={{ padding: "12px", borderBottom: "2px solid #e5e7eb" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "12px" }}>{user.name}</td>
                <td style={{ padding: "12px" }}>{user.email}</td>
                <td style={{ padding: "12px" }}>{user.role}</td>
                <td style={{ padding: "12px" }}>
                  <button {...api.getTriggerProps({ value: `${user.id}` })}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: "20px", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px" }}>
          <strong>Active Trigger:</strong> {api.triggerValue || "-"} <br />
          <strong>Active User:</strong> {activeUser ? `${activeUser.name} (${activeUser.email})` : "-"}
        </div>

        <Presence className={styles.backdrop} {...api.getBackdropProps()} />
        <div className={styles.positioner} {...api.getPositionerProps()}>
          <Presence className={styles.content} {...api.getContentProps()}>
            <div className={styles.grabber} {...api.getGrabberProps()}>
              <div className={styles.grabberIndicator} {...api.getGrabberIndicatorProps()} />
            </div>
            {activeUser ? (
              <>
                <div {...api.getTitleProps()}>Edit {activeUser.name}</div>
                <div style={{ padding: "16px" }}>
                  <div style={{ marginBottom: "12px" }}>
                    <label>Name</label>
                    <input type="text" value={activeUser.name} style={{ display: "block", width: "100%" }} />
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <label>Email</label>
                    <input type="email" value={activeUser.email} style={{ display: "block", width: "100%" }} />
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <label>Role</label>
                    <select value={activeUser.role} style={{ display: "block", width: "100%" }}>
                      <option value="Admin">Admin</option>
                      <option value="Editor">Editor</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>
                  <button {...api.getCloseTriggerProps()}>Close</button>
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

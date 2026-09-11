import { X } from "lucide-static"
import { defineHandler } from "nitro"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { Presence } from "../../components/presence"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/dialog.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data="{activeUser: null}"
          x-dialog="{
            id: $id('dialog'),
            onTriggerValueChange({ value }) {
              const user = $users.find((u) => `${u.id}` === value) ?? null;
              activeUser = user;
            },
          }"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main style={{ padding: "40px", fontFamily: "system-ui" }}>
            <section style={{ marginBottom: "40px" }}>
              <h2>User Management Table</h2>

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
                  <template x-for="user in $users" x-bind:key="user.id">
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "12px" }} x-text="user.name"></td>
                      <td style={{ padding: "12px" }} x-text="user.email"></td>
                      <td style={{ padding: "12px" }} x-text="user.role"></td>
                      <td style={{ padding: "12px", display: "flex", gap: "8px" }}>
                        <button x-dialog:trigger="{value: `${user.id}`}">Edit</button>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>

              <div style={{ marginTop: "20px", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px" }}>
                <strong>Active Trigger:</strong> <div x-text="$dialog().triggerValue || '-'"></div> <br />
                <strong>Active User:</strong>
                <div x-text="activeUser ? `${activeUser.name} (${activeUser.email})` : '-'"></div>
              </div>
            </section>

            <template x-teleport="body">
              <div>
                <Presence x-dialog:backdrop x-data="{get present() {return $dialog().open}}" />
                <div x-dialog:positioner>
                  <Presence x-dialog:content x-data="{get present() {return $dialog().open}}">
                    <template x-if="activeUser">
                      <div>
                        <h2 x-dialog:title>Edit User</h2>
                        <p x-dialog:description x-text="'Update information for ' + activeUser.name"></p>
                        <div style={{ marginBottom: "20px" }}>
                          <div style={{ marginBottom: "12px" }}>
                            <label>Name</label>
                            <input
                              type="text"
                              x-bind:value="activeUser.name"
                              style={{ display: "block", width: "100%" }}
                            />
                          </div>
                          <div style={{ marginBottom: "12px" }}>
                            <label>Email</label>
                            <input
                              type="email"
                              x-bind:value="activeUser.email"
                              style={{ display: "block", width: "100%" }}
                            />
                          </div>
                          <div style={{ marginBottom: "12px" }}>
                            <label>Role</label>
                            <select x-bind:value="activeUser.role" style={{ display: "block", width: "100%" }}>
                              <option value="Admin">Admin</option>
                              <option value="Editor">Editor</option>
                              <option value="Viewer">Viewer</option>
                            </select>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                          <button x-dialog:close-trigger>{html(X)}</button>
                          <button>Save Changes</button>
                        </div>
                      </div>
                    </template>

                    <template x-if="!activeUser">
                      <div>No user selected</div>
                    </template>
                  </Presence>
                </div>
              </div>
            </template>
          </main>

          <Toolbar viz>
            <StateVisualizer label="dialog" context={["triggerValue"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})

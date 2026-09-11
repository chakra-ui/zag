import { defineHandler } from "nitro"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/menu.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data="{activeFile: null}"
          x-menu="{
            id: $id('menu'),
            onTriggerValueChange({ value }) {
              const file = $files.find((f) => `${f.id}` === value) ?? null;
              activeFile = file;
            },
            onSelect({ value }) {
              if (activeFile) {
                console.log(`Action: ${value} on ${activeFile.name}`)
              }
            },
          }"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main style={{ padding: "40px", fontFamily: "system-ui" }}>
            <h2>File Explorer - Right-click on any item</h2>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Right-click on different files/folders to open the context menu. The menu will reposition to the click
              location.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: "16px",
                padding: "20px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
              }}
            >
              <template x-for="file in $files" x-bind:key="file.id">
                <div
                  x-menu:context-trigger="{value: `${file.id}`}"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "16px",
                    backgroundColor: "white",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    cursor: "context-menu",
                    userSelect: "none",
                    transition: "box-shadow 0.2s",
                  }}
                >
                  <span style={{ fontSize: "32px", marginBottom: "8px" }} x-text="file.icon"></span>
                  <span
                    style={{ fontSize: "14px", textAlign: "center", wordBreak: "break-word" }}
                    x-text="file.name"
                  ></span>
                </div>
              </template>
            </div>

            <div style={{ marginTop: "20px", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px" }}>
              <strong>Active Trigger:</strong> <div x-text="$menu().triggerValue || '-'"></div> <br />
              <strong>Active File:</strong>{" "}
              <div x-text="activeFile ? `${activeFile.icon} ${activeFile.name} (${activeFile.type})` : '-'"></div>
            </div>

            <template x-teleport="body">
              <div x-menu:positioner>
                <ul
                  x-menu:content
                  style={{
                    listStyle: "none",
                    margin: 0,
                    padding: "4px",
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                    minWidth: "160px",
                  }}
                >
                  <li
                    x-menu:item="{value: 'open'}"
                    style={{ padding: "8px 12px", cursor: "pointer", borderRadius: "4px" }}
                    x-text="'Open ' + (activeFile?.type === 'folder' ? 'Folder' : 'File')"
                  ></li>
                  <li
                    x-menu:item="{value: 'rename'}"
                    style={{ padding: "8px 12px", cursor: "pointer", borderRadius: "4px" }}
                  >
                    Rename
                  </li>
                  <li
                    x-menu:item="{value: 'copy'}"
                    style={{ padding: "8px 12px", cursor: "pointer", borderRadius: "4px" }}
                  >
                    Copy
                  </li>
                  <li
                    x-menu:item="{value: 'cut'}"
                    style={{ padding: "8px 12px", cursor: "pointer", borderRadius: "4px" }}
                  >
                    Cut
                  </li>
                  <li
                    style={{
                      height: "1px",
                      backgroundColor: "#e5e7eb",
                      margin: "4px 0",
                    }}
                  />
                  <li
                    x-menu:item="{value: 'delete'}"
                    style={{ padding: "8px 12px", cursor: "pointer", borderRadius: "4px", color: "#dc2626" }}
                  >
                    Delete
                  </li>
                </ul>
              </div>
            </template>
          </main>

          <Toolbar viz>
            <StateVisualizer label="menu" context={["triggerValue", "anchorPoint"]} />
          </Toolbar>
        </div>
      </body>
    </html>
  )
})

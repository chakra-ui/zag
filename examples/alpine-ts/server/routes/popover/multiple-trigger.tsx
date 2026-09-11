import { MoreVertical } from "lucide-static"
import { defineHandler } from "nitro"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { Presence } from "../../components/presence"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/popover.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data="{activeDocument: null}"
          x-popover="{
            id: $id('popover'),
            onTriggerValueChange({ value }) {
              const doc = $documents.find((d) => `${d.id}` === value) ?? null;
              activeDocument = doc;
            },
          }"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main>
            <section style={{ marginBottom: "40px" }}>
              <h2>Document Manager - Popover with Multiple Triggers</h2>

              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f3f4f6", textAlign: "left" }}>
                    <th style={{ padding: "12px", borderBottom: "2px solid #e5e7eb" }}>Name</th>
                    <th style={{ padding: "12px", borderBottom: "2px solid #e5e7eb" }}>Type</th>
                    <th style={{ padding: "12px", borderBottom: "2px solid #e5e7eb" }}>Size</th>
                    <th style={{ padding: "12px", borderBottom: "2px solid #e5e7eb" }}>Modified</th>
                    <th style={{ padding: "12px", borderBottom: "2px solid #e5e7eb" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <template x-for="doc in $documents" x-bind:key="doc.id">
                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "12px" }} x-text="doc.name"></td>
                      <td style={{ padding: "12px" }} x-text="doc.type"></td>
                      <td style={{ padding: "12px" }} x-text="doc.size"></td>
                      <td style={{ padding: "12px" }} x-text="doc.modified"></td>
                      <td style={{ padding: "12px" }}>
                        <button x-popover:trigger="{value: `${doc.id}`}">{html(MoreVertical)}</button>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>

              <div style={{ marginTop: "20px", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px" }}>
                <strong>Active Trigger:</strong> <div x-text="$popover().triggerValue || '-'"></div> <br />
                <strong>Active Document:</strong>{" "}
                <div x-text="activeDocument ? `${activeDocument.name} (${activeDocument.type})` : '-'"></div>
              </div>
            </section>

            <template x-teleport="body">
              <div x-popover:positioner>
                <Presence
                  x-popover:content
                  x-data="{get present() {return $popover().open}}"
                  style={{
                    position: "relative",
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    padding: "12px",
                    minWidth: "200px",
                  }}
                >
                  <div
                    x-popover:title
                    style={{ fontWeight: "bold", marginBottom: "8px" }}
                    x-text="activeDocument?.name"
                  ></div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <button
                      style={{
                        textAlign: "left",
                        padding: "8px",
                        borderRadius: "4px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Open
                    </button>
                    <button
                      style={{
                        textAlign: "left",
                        padding: "8px",
                        borderRadius: "4px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Rename
                    </button>
                    <button
                      style={{
                        textAlign: "left",
                        padding: "8px",
                        borderRadius: "4px",
                        border: "none",
                        cursor: "pointer",
                        color: "red",
                      }}
                    >
                      Delete
                    </button>
                    <button
                      x-popover:close-trigger
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        padding: "4px",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        fontSize: "16px",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </Presence>
              </div>
            </template>
          </main>
        </div>
      </body>
    </html>
  )
})

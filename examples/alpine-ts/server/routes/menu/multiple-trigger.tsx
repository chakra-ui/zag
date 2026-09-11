import { MoreVertical } from "lucide-static"
import { defineHandler } from "nitro"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { Presence } from "../../components/presence"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/menu.ts"></script>
      </Head>

      <body>
        <div
          class="page"
          x-data="{activeDocument: null}"
          x-menu="{
            id: $id('menu'),
            onTriggerValueChange({ value }) {
              const doc = $documents.find((d) => `${d.id}` === value) ?? null;
              activeDocument = doc;
            },
          }"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main>
            <section style={{ marginBottom: "40px" }}>
              <h2>Document Manager</h2>

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
                        <button x-menu:trigger="{value: `${doc.id}`}">{html(MoreVertical)}</button>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>

              <div style={{ marginTop: "20px", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px" }}>
                <strong>Active Trigger:</strong> <div x-text="$menu().triggerValue || '-'"></div> <br />
                <strong>Active Document:</strong>{" "}
                <div x-text="activeDocument ? `${activeDocument.name} (${activeDocument.type})` : '-'"></div>
              </div>
            </section>

            <template x-teleport="body">
              <div x-menu:positioner>
                <Presence x-menu:content x-data="{get present() {return $menu().open}}">
                  <div x-menu:item="{value: 'rename'}" x-text="'Rename (value: '+ $menu().triggerValue + ')'"></div>
                  <div x-menu:item="{value: 'delete'}" x-text="'Delete (value: '+ $menu().triggerValue + ')'"></div>
                </Presence>
              </div>
            </template>
          </main>
        </div>
      </body>
    </html>
  )
})

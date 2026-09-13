import { defineHandler } from "nitro"
import { Head } from "../../components/head"
import { Nav } from "../../components/nav"
import { Presence } from "../../components/presence"

export default defineHandler((event) => {
  return (
    <html>
      <Head>
        <script type="module" src="/scripts/hover-card.ts"></script>
      </Head>
      <body>
        <div
          class="page"
          x-data="{activeUser: null}"
          x-hover-card="{
            id: $id('hover-card'),
            onTriggerValueChange({ value }) {
              const user = $users.find((u) => `${u.id}` === value) ?? null;
              activeUser = user;
            },
          }"
        >
          <Nav currentComponent={event.context.currentComponent as string} />

          <main style={{ padding: "40px" }}>
            <h2 style={{ marginBottom: "24px" }}>Team Members - Hover Card with Multiple Triggers</h2>

            <p style={{ marginBottom: "24px", color: "#666" }}>
              Hover over any team member to see their profile card. The card will reposition to the hovered member.
            </p>

            <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
              <template x-for="user in $users" x-bind:key="user.id">
                <a
                  href="#"
                  x-hover-card:trigger="{value: `${user.id}`}"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    textDecoration: "none",
                    color: "inherit",
                    transition: "box-shadow 0.2s",
                  }}
                >
                  <img
                    x-bind:src="user.avatar"
                    x-bind:alt="user.name"
                    style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                  />
                  <div>
                    <div style={{ fontWeight: "bold" }} x-text="user.name"></div>
                    <div style={{ color: "#666", fontSize: "14px" }} x-text="user.username"></div>
                  </div>
                </a>
              </template>
            </div>

            <div style={{ marginTop: "24px", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px" }}>
              <strong>Active Trigger:</strong> <div x-text="$hoverCard().triggerValue || '-'"></div> <br />
              <strong>Active User:</strong>{" "}
              <div x-text="activeUser ? `${activeUser.name} (${activeUser.username})` : '-'"></div>
            </div>

            <template x-teleport="body">
              <div x-hover-card:positioner>
                <Presence
                  x-hover-card:content
                  x-data="{get present() {return $hoverCard().open}}"
                  style={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                    padding: "20px",
                    width: "320px",
                  }}
                >
                  <template x-if="activeUser">
                    <div>
                      <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                        <img
                          x-bind:src="activeUser.avatar"
                          x-bind:alt="activeUser.name"
                          style={{ width: "64px", height: "64px", borderRadius: "50%" }}
                        />
                        <div>
                          <div style={{ fontWeight: "bold", fontSize: "18px" }} x-text="activeUser.name"></div>
                          <div style={{ color: "#666" }} x-text="activeUser.username"></div>
                        </div>
                      </div>
                      <p style={{ marginBottom: "16px", color: "#444" }} x-text="activeUser.bio"></p>
                      <div style={{ display: "flex", gap: "24px", color: "#666", fontSize: "14px" }}>
                        <div>
                          <strong style={{ color: "#000" }} x-text="activeUser.followers.toLocaleString()"></strong>{" "}
                          Followers
                        </div>
                        <div>
                          <strong style={{ color: "#000" }} x-text="activeUser.following.toLocaleString()"></strong>{" "}
                          Following
                        </div>
                      </div>
                    </div>
                  </template>
                </Presence>
              </div>
            </template>
          </main>
        </div>
      </body>
    </html>
  )
})

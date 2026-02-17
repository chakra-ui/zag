import * as hoverCard from "@zag-js/hover-card"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { Presence } from "~/components/presence"

interface User {
  id: number
  name: string
  username: string
  avatar: string
  bio: string
  followers: number
  following: number
}

const users: User[] = [
  {
    id: 1,
    name: "Alice Johnson",
    username: "@alice",
    avatar: "https://i.pravatar.cc/150?u=alice",
    bio: "Full-stack developer passionate about React and TypeScript",
    followers: 1234,
    following: 567,
  },
  {
    id: 2,
    name: "Bob Smith",
    username: "@bob",
    avatar: "https://i.pravatar.cc/150?u=bob",
    bio: "UX Designer | Coffee enthusiast | Dog lover",
    followers: 890,
    following: 234,
  },
  {
    id: 3,
    name: "Charlie Brown",
    username: "@charlie",
    avatar: "https://i.pravatar.cc/150?u=charlie",
    bio: "DevOps engineer | Cloud enthusiast | Open source contributor",
    followers: 2345,
    following: 123,
  },
  {
    id: 4,
    name: "Diana Prince",
    username: "@diana",
    avatar: "https://i.pravatar.cc/150?u=diana",
    bio: "Product Manager | Tech blogger | Speaker",
    followers: 5678,
    following: 890,
  },
]

export default function HoverCardMultipleTrigger() {
  const [activeUser, setActiveUser] = createSignal<User | null>(null)

  const service = useMachine(hoverCard.machine, {
    id: createUniqueId(),
    onTriggerValueChange({ value }) {
      const user = users.find((u) => `${u.id}` === value) ?? null
      setActiveUser(user)
    },
  })

  const api = createMemo(() => hoverCard.connect(service, normalizeProps))

  return (
    <main style={{ padding: "40px" }}>
      <h2 style={{ "margin-bottom": "24px" }}>Team Members - Hover Card with Multiple Triggers</h2>

      <p style={{ "margin-bottom": "24px", color: "#666" }}>
        Hover over any team member to see their profile card. The card will reposition to the hovered member.
      </p>

      <div style={{ display: "flex", gap: "24px", "flex-wrap": "wrap" }}>
        <For each={users}>
          {(user) => (
            <a
              href="#"
              {...api().getTriggerProps({ value: `${user.id}` })}
              style={{
                display: "flex",
                "align-items": "center",
                gap: "12px",
                padding: "12px 16px",
                "border-radius": "8px",
                border: "1px solid #e5e7eb",
                "text-decoration": "none",
                color: "inherit",
                transition: "box-shadow 0.2s",
              }}
            >
              <img
                src={user.avatar}
                alt={user.name}
                style={{ width: "40px", height: "40px", "border-radius": "50%" }}
              />
              <div>
                <div style={{ "font-weight": "bold" }}>{user.name}</div>
                <div style={{ color: "#666", "font-size": "14px" }}>{user.username}</div>
              </div>
            </a>
          )}
        </For>
      </div>

      <div
        style={{
          "margin-top": "24px",
          padding: "12px",
          "background-color": "#f9fafb",
          "border-radius": "6px",
        }}
      >
        <strong>Active Trigger:</strong> {api().triggerValue || "-"} <br />
        <strong>Active User:</strong> {activeUser() ? `${activeUser()!.name} (${activeUser()!.username})` : "-"}
      </div>

      <Show when={api().open}>
        <Portal>
          <div {...api().getPositionerProps()}>
            <Presence
              {...api().getContentProps()}
              style={{
                "background-color": "white",
                border: "1px solid #e5e7eb",
                "border-radius": "12px",
                "box-shadow": "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                padding: "20px",
                width: "320px",
              }}
            >
              {activeUser() && (
                <>
                  <div style={{ display: "flex", gap: "16px", "margin-bottom": "16px" }}>
                    <img
                      src={activeUser()!.avatar}
                      alt={activeUser()!.name}
                      style={{ width: "64px", height: "64px", "border-radius": "50%" }}
                    />
                    <div>
                      <div style={{ "font-weight": "bold", "font-size": "18px" }}>{activeUser()!.name}</div>
                      <div style={{ color: "#666" }}>{activeUser()!.username}</div>
                    </div>
                  </div>
                  <p style={{ "margin-bottom": "16px", color: "#444" }}>{activeUser()!.bio}</p>
                  <div style={{ display: "flex", gap: "24px", color: "#666", "font-size": "14px" }}>
                    <div>
                      <strong style={{ color: "#000" }}>{activeUser()!.followers.toLocaleString()}</strong> Followers
                    </div>
                    <div>
                      <strong style={{ color: "#000" }}>{activeUser()!.following.toLocaleString()}</strong> Following
                    </div>
                  </div>
                </>
              )}
            </Presence>
          </div>
        </Portal>
      </Show>
    </main>
  )
}

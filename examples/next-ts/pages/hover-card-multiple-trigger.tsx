import * as hoverCard from "@zag-js/hover-card"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId, useState } from "react"

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
  const [activeUser, setActiveUser] = useState<User | null>(null)

  const service = useMachine(hoverCard.machine, {
    id: useId(),
    onTriggerValueChange({ value }) {
      const user = users.find((u) => `${u.id}` === value) ?? null
      setActiveUser(user)
    },
  })

  const api = hoverCard.connect(service, normalizeProps)

  return (
    <main style={{ padding: "40px" }}>
      <h2 style={{ marginBottom: "24px" }}>Team Members - Hover Card with Multiple Triggers</h2>

      <p style={{ marginBottom: "24px", color: "#666" }}>
        Hover over any team member to see their profile card. The card will reposition to the hovered member.
      </p>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        {users.map((user) => (
          <a
            key={user.id}
            href="#"
            {...api.getTriggerProps({ value: `${user.id}` })}
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
            <img src={user.avatar} alt={user.name} style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
            <div>
              <div style={{ fontWeight: "bold" }}>{user.name}</div>
              <div style={{ color: "#666", fontSize: "14px" }}>{user.username}</div>
            </div>
          </a>
        ))}
      </div>

      <div style={{ marginTop: "24px", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px" }}>
        <strong>Active Trigger:</strong> {api.triggerValue || "-"} <br />
        <strong>Active User:</strong> {activeUser ? `${activeUser.name} (${activeUser.username})` : "-"}
      </div>

      <Portal>
        <div {...api.getPositionerProps()}>
          <div
            {...api.getContentProps()}
            style={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              padding: "20px",
              width: "320px",
            }}
          >
            {activeUser && (
              <>
                <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                  <img
                    src={activeUser.avatar}
                    alt={activeUser.name}
                    style={{ width: "64px", height: "64px", borderRadius: "50%" }}
                  />
                  <div>
                    <div style={{ fontWeight: "bold", fontSize: "18px" }}>{activeUser.name}</div>
                    <div style={{ color: "#666" }}>{activeUser.username}</div>
                  </div>
                </div>
                <p style={{ marginBottom: "16px", color: "#444" }}>{activeUser.bio}</p>
                <div style={{ display: "flex", gap: "24px", color: "#666", fontSize: "14px" }}>
                  <div>
                    <strong style={{ color: "#000" }}>{activeUser.followers.toLocaleString()}</strong> Followers
                  </div>
                  <div>
                    <strong style={{ color: "#000" }}>{activeUser.following.toLocaleString()}</strong> Following
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Portal>
    </main>
  )
}

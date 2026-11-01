"use client"

import * as hoverCard from "@zag-js/hover-card"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { Presence } from "@/components/presence"
import "@styles/hover-card.css"

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
    <main className="hover-card">
      <p>Hover a team member to preview their profile. The card follows the hovered trigger.</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {users.map((user) => (
          <a key={user.id} href="#" className="profile-chip" {...api.getTriggerProps({ value: `${user.id}` })}>
            <img src={user.avatar} alt="" />
            {user.name}
          </a>
        ))}
      </div>

      <output>
        Active trigger: {api.triggerValue || "-"} · Active user: {activeUser?.name ?? "-"}
      </output>

      <Portal>
        <div {...api.getPositionerProps()}>
          <Presence {...api.getContentProps()}>
            {activeUser && (
              <div className="profile">
                <img className="profile-avatar" src={activeUser.avatar} alt="" />
                <div className="profile-body">
                  <span className="profile-name">{activeUser.name}</span>
                  <span className="profile-handle">{activeUser.username}</span>
                  <p className="profile-bio">{activeUser.bio}</p>
                  <span className="profile-meta">
                    {activeUser.followers.toLocaleString()} followers · {activeUser.following.toLocaleString()}{" "}
                    following
                  </span>
                </div>
              </div>
            )}
          </Presence>
        </div>
      </Portal>
    </main>
  )
}

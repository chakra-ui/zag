import * as hoverCard from "@zag-js/hover-card"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, Show, createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { Presence } from "~/components/presence"
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
    <main class="hover-card">
      <p>Hover a team member to preview their profile. The card follows the hovered trigger.</p>

      <div style={{ display: "flex", "flex-wrap": "wrap", gap: "8px" }}>
        <For each={users}>
          {(user) => (
            <a href="#" class="profile-chip" {...api().getTriggerProps({ value: `${user.id}` })}>
              <img src={user.avatar} alt="" />
              {user.name}
            </a>
          )}
        </For>
      </div>

      <output>
        Active trigger: {api().triggerValue || "-"} · Active user: {activeUser()?.name ?? "-"}
      </output>

      <Show when={api().open}>
        <Portal>
          <div {...api().getPositionerProps()}>
            <Presence {...api().getContentProps()}>
              <Show when={activeUser()}>
                {(user) => (
                  <div class="profile">
                    <img class="profile-avatar" src={user().avatar} alt="" />
                    <div class="profile-body">
                      <span class="profile-name">{user().name}</span>
                      <span class="profile-handle">{user().username}</span>
                      <p class="profile-bio">{user().bio}</p>
                      <span class="profile-meta">
                        {user().followers.toLocaleString()} followers · {user().following.toLocaleString()} following
                      </span>
                    </div>
                  </div>
                )}
              </Show>
            </Presence>
          </div>
        </Portal>
      </Show>
    </main>
  )
}

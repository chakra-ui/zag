<script setup lang="ts">
import * as hoverCard from "@zag-js/hover-card"
import { normalizeProps, useMachine } from "@zag-js/vue"
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

const activeUser = ref<User | null>(null)

const service = useMachine(hoverCard.machine, {
  id: useId(),
  onTriggerValueChange({ value }) {
    activeUser.value = users.find((u) => `${u.id}` === value) ?? null
  },
})

const api = computed(() => hoverCard.connect(service, normalizeProps))
</script>

<template>
  <main class="hover-card">
    <p>Hover a team member to preview their profile. The card follows the hovered trigger.</p>

    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <a
        v-for="user in users"
        :key="user.id"
        href="#"
        class="profile-chip"
        v-bind="api.getTriggerProps({ value: `${user.id}` })"
      >
        <img :src="user.avatar" alt="" />
        {{ user.name }}
      </a>
    </div>

    <output>Active trigger: {{ api.triggerValue || "-" }} · Active user: {{ activeUser?.name ?? "-" }}</output>

    <Teleport to="#teleports">
      <div v-bind="api.getPositionerProps()">
        <Presence v-bind="api.getContentProps()">
          <div v-if="activeUser" class="profile">
            <img class="profile-avatar" :src="activeUser.avatar" alt="" />
            <div class="profile-body">
              <span class="profile-name">{{ activeUser.name }}</span>
              <span class="profile-handle">{{ activeUser.username }}</span>
              <p class="profile-bio">{{ activeUser.bio }}</p>
              <span class="profile-meta">
                {{ activeUser.followers.toLocaleString() }} followers ·
                {{ activeUser.following.toLocaleString() }} following
              </span>
            </div>
          </div>
        </Presence>
      </div>
    </Teleport>
  </main>
</template>

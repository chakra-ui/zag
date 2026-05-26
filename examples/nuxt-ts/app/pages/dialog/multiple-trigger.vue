<script lang="ts" setup>
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/vue"

interface User {
  id: number
  name: string
  email: string
  role: string
}

const users: User[] = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Admin" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "Editor" },
  { id: 3, name: "Carol Davis", email: "carol@example.com", role: "Viewer" },
  { id: 4, name: "David Wilson", email: "david@example.com", role: "Editor" },
  { id: 5, name: "Eve Martinez", email: "eve@example.com", role: "Admin" },
]

const activeUser = ref<User | null>(null)

const service = useMachine(dialog.machine, {
  id: useId(),
  onTriggerValueChange({ value }) {
    activeUser.value = users.find((u) => `${u.id}` === value) ?? null
  },
})

const api = computed(() => dialog.connect(service, normalizeProps))
</script>

<template>
  <main>
    <h2>User Management Table</h2>

    <table style="width: 100%; border-collapse: collapse; margin-top: 20px">
      <thead>
        <tr style="background-color: #f3f4f6; text-align: left">
          <th style="padding: 12px; border-bottom: 2px solid #e5e7eb">Name</th>
          <th style="padding: 12px; border-bottom: 2px solid #e5e7eb">Email</th>
          <th style="padding: 12px; border-bottom: 2px solid #e5e7eb">Role</th>
          <th style="padding: 12px; border-bottom: 2px solid #e5e7eb">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id" style="border-bottom: 1px solid #e5e7eb">
          <td style="padding: 12px">{{ user.name }}</td>
          <td style="padding: 12px">{{ user.email }}</td>
          <td style="padding: 12px">{{ user.role }}</td>
          <td style="padding: 12px">
            <button v-bind="api.getTriggerProps({ value: `${user.id}` })">Edit</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 20px; padding: 12px; background-color: #f9fafb; border-radius: 6px">
      <strong>Active Trigger:</strong> {{ api.triggerValue || "-" }} <br />
      <strong>Active User:</strong>
      {{ activeUser ? `${activeUser.name} (${activeUser.email})` : "-" }}
    </div>

    <Teleport to="#teleports">
      <Presence v-bind="api.getBackdropProps()" />
      <div v-bind="api.getPositionerProps()">
        <Presence v-bind="api.getContentProps()">
          <template v-if="activeUser">
            <h2 v-bind="api.getTitleProps()">Edit User</h2>
            <p v-bind="api.getDescriptionProps()">Update information for {{ activeUser.name }}</p>
            <div style="margin-bottom: 20px">
              <div style="margin-bottom: 12px">
                <label>Name</label>
                <input type="text" :value="activeUser.name" style="display: block; width: 100%" />
              </div>
              <div style="margin-bottom: 12px">
                <label>Email</label>
                <input type="email" :value="activeUser.email" style="display: block; width: 100%" />
              </div>
              <div style="margin-bottom: 12px">
                <label>Role</label>
                <select :value="activeUser.role" style="display: block; width: 100%">
                  <option value="Admin">Admin</option>
                  <option value="Editor">Editor</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
            </div>
            <button v-bind="api.getCloseTriggerProps()">Close</button>
          </template>
          <div v-else>No user selected</div>
        </Presence>
      </div>
    </Teleport>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

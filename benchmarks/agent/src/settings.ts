const visibilities = [
  { value: "private", label: "Private" },
  { value: "internal", label: "Internal" },
  { value: "public", label: "Public" },
]

const members = [
  "Ada Okafor",
  "Ben Carter",
  "Chloé Martin",
  "Daniel Kim",
  "Elena Rossi",
  "Farah Haddad",
  "Gabriel Silva",
  "Hana Sato",
  "Ivan Petrov",
  "Julia Novak",
  "Kofi Mensah",
  "Lena Fischer",
  "Mateo García",
  "Nadia Ali",
  "Oscar Lindqvist",
  "Priya Shah",
  "Quinn Murphy",
  "Rafael Costa",
  "Sofia Andersson",
  "Tom Becker",
  "Uma Iyer",
  "Victor Dubois",
  "Wen Li",
  "Yusuf Demir",
].map((name, index) => ({
  id: name.toLowerCase().replace(/[^a-z]+/g, "-"),
  name,
  role: index === 0 ? "admin" : "member",
}))

const channels = [
  {
    value: "email" as const,
    label: "Email",
    notifications: [
      { value: "deploy-failures", label: "Deploy failures", on: false },
      { value: "weekly-digest", label: "Weekly digest", on: true },
      { value: "mentions", label: "Mentions", on: true },
    ],
  },
  {
    value: "slack" as const,
    label: "Slack",
    notifications: [
      { value: "deploy-failures", label: "Deploy failures", on: true },
      { value: "new-members", label: "New members", on: false },
    ],
  },
]

type Member = (typeof members)[number]

type Settings = {
  name: string
  visibility: string
  members: Member[]
  email: Record<string, boolean>
  slack: Record<string, boolean>
}

const switches = (channel: (typeof channels)[number]) =>
  Object.fromEntries(channel.notifications.map((item) => [item.value, item.on]))

function initialSettings(): Settings {
  return {
    name: "Apollo",
    visibility: "private",
    members: members.map((member) => ({ ...member })),
    email: switches(channels[0]),
    slack: switches(channels[1]),
  }
}

// Every screen reports a save here, and the harness scores what it finds.
function save(settings: Settings) {
  const page = window as unknown as { __saved?: Settings[] }
  page.__saved ??= []
  page.__saved.push(JSON.parse(JSON.stringify(settings)))
}

// `?panels=keep` keeps closed tab and accordion panels in the page, hidden.
// Without it they unmount, as ui-sdk's do by default.
const keepPanels = new URLSearchParams(globalThis.location?.search).get("panels") === "keep"

export { channels, keepPanels, initialSettings, type Member, save, type Settings, visibilities }

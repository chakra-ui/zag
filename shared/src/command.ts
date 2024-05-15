export interface Command {
  name: string
  title: string
  description?: string
  extension?: Omit<Extension, "commands">
}

export interface Extension {
  name: string
  title: string
  description?: string
  commands: Command[]
}

export const applications: Command[] = [
  { name: "app-app-store", title: "App Store", description: "Browse and download apps" },
  { name: "app-books", title: "Books", description: "Read and manage books" },
  { name: "app-calculator", title: "Calculator", description: "Perform mathematical calculations" },
  { name: "app-calendar", title: "Calendar", description: "Manage events and appointments" },
  { name: "app-contacts", title: "Contacts", description: "Manage your contacts" },
  { name: "app-mail", title: "Mail", description: "Manage your email" },
  { name: "app-podcasts", title: "Podcasts", description: "Listen to podcasts" },
  { name: "app-notes", title: "Notes", description: "Create and manage notes" },
]

export const extensions: Extension[] = [
  {
    name: "ext-calendar",
    title: "Calendar Extension",
    description: "Extend calendar functionality",
    commands: [
      { name: "cmd-calendar-my-schedule", title: "My Schedule", description: "View your schedule" },
      { name: "cmd-calendar-create-event", title: "Create Event", description: "Create a new event" },
      { name: "cmd-calendar-edit-event", title: "Edit Event", description: "Edit an existing event" },
    ],
  },
  {
    name: "ext-color-picker",
    title: "Color Picker Extension",
    description: "Pick colors and manage color palettes",
    commands: [
      {
        name: "cmd-color-picker-menu-bar",
        title: "Menu Bar Color Picker",
        description: "Pick colors from the menu bar",
      },
      { name: "cmd-color-picker-organize-colors", title: "Organize Colors", description: "Manage color palettes" },
      { name: "cmd-color-picker-pick", title: "Pick Color", description: "Pick a color from the screen" },
    ],
  },
  {
    name: "ext-contacts",
    title: "Contacts Extension",
    description: "Extend contacts management",
    commands: [
      { name: "cmd-contacts-search", title: "Search Contacts", description: "Search and find contacts" },
      { name: "cmd-contacts-import", title: "Import Contacts", description: "Import contacts from a file" },
      { name: "cmd-contacts-export", title: "Export Contacts", description: "Export contacts to a file" },
    ],
  },
  {
    name: "ext-developer",
    title: "Developer Extension",
    description: "Tools for developers",
    commands: [
      { name: "cmd-developer-create-extension", title: "Create Extension", description: "Create a new extension" },
      {
        name: "cmd-developer-extension-diagnostics",
        title: "Extension Diagnostics",
        description: "Check extension health and performance",
      },
      {
        name: "cmd-developer-import-extension",
        title: "Import Extension",
        description: "Import an existing extension",
      },
      {
        name: "cmd-developer-manage-extension",
        title: "Manage Extensions",
        description: "Manage installed extensions",
      },
    ],
  },
  {
    name: "ext-ai",
    title: "AI Extension",
    description: "Artificial intelligence capabilities",
    commands: [
      { name: "cmd-ai-chat", title: "AI Chat", description: "Chat with an AI assistant" },
      { name: "cmd-ai-create-ai-command", title: "Create AI Command", description: "Create custom AI commands" },
      { name: "cmd-ai-import-ai-commands", title: "Import AI Commands", description: "Import predefined AI commands" },
      {
        name: "cmd-ai-search-ai-commands",
        title: "Search AI Commands",
        description: "Search for available AI commands",
      },
      { name: "cmd-ai-send-to-ai-chat", title: "Send to AI Chat", description: "Send text to AI chat for processing" },
      {
        name: "cmd-ai-fix-spelling-and-grammar",
        title: "Fix Spelling and Grammar",
        description: "Correct spelling and grammar mistakes",
      },
      { name: "cmd-ai-improve-writing", title: "Improve Writing", description: "Get suggestions to improve writing" },
    ],
  },
]

export const commands = extensions.flatMap(({ commands, ...extension }) =>
  commands?.map((command) => ({ extension, ...command })),
)

export const allItems = [...applications, ...commands]

export const suggestions = [
  "cmd-contacts-search",
  "cmd-ai-improve-writing",
  "app-calendar",
  "app-app-store",
  "app-books",
]
  .map((name) => allItems.find((item) => item.name === name))
  .filter((item): item is NonNullable<typeof item> => !!item)

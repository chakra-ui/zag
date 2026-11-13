export const planOptions = [
  { id: "free", label: "Free", price: "$0 / month", note: "1 project" },
  { id: "pro", label: "Pro", price: "$12 / month", note: "Unlimited projects" },
  { id: "team", label: "Team", price: "$29 / month", note: "Shared workspaces" },
  { id: "enterprise", label: "Enterprise", price: "Custom", note: "Sold out", disabled: true },
]

export const contactMethods = [
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone call" },
  { id: "post", label: "Post" },
]

export const timeRanges = [
  { id: "day", label: "Day", caption: "Page views per 3 hours, last 24 hours", bars: [12, 8, 5, 9, 22, 35, 48, 41] },
  { id: "week", label: "Week", caption: "Page views per day, last 7 days", bars: [320, 410, 380, 450, 520, 290, 240] },
  { id: "month", label: "Month", caption: "Page views per week, last 4 weeks", bars: [2100, 2450, 2300, 2800] },
  {
    id: "year",
    label: "Year",
    caption: "Page views per month, last 12 months",
    bars: [8200, 7900, 9100, 9800, 10400, 11200, 10800, 11900, 12600, 12100, 13400, 14200],
  },
]

export const settingsSections = [
  { id: "profile", label: "Profile", description: "Your name, photo and public bio." },
  { id: "notifications", label: "Notifications", description: "Choose which emails and push alerts you receive." },
  { id: "billing", label: "Billing", description: "Update your card and download past invoices." },
  { id: "security", label: "Security", description: "Change your password and manage two-factor sign-in." },
]

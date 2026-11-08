export const shippingOptions = [
  { id: "standard", label: "Standard", price: "$4.99", delivery: "5-7 business days" },
  { id: "express", label: "Express", price: "$12.00", delivery: "2-3 business days" },
  { id: "overnight", label: "Overnight", price: "$24.50", delivery: "Next business day" },
]

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
  { id: "day", label: "Day", caption: "Page views per hour, last 24 hours", bars: [12, 8, 5, 9, 22, 35, 48, 41] },
  { id: "week", label: "Week", caption: "Page views per day, last 7 days", bars: [320, 410, 380, 450, 520, 290, 240] },
  { id: "month", label: "Month", caption: "Page views per week, last 4 weeks", bars: [2100, 2450, 2300, 2800] },
  {
    id: "year",
    label: "Year",
    caption: "Page views per month, last 12 months",
    bars: [8200, 7900, 9100, 9800, 10400, 11200, 10800, 11900, 12600, 12100, 13400, 14200],
  },
]

export const alignOptions = [
  { id: "left", label: "Align left", icon: "M3 4h14M3 8h9M3 12h14M3 16h9" },
  { id: "center", label: "Align center", icon: "M3 4h14M6 8h8M3 12h14M6 16h8" },
  { id: "right", label: "Align right", icon: "M3 4h14M8 8h9M3 12h14M8 16h9" },
  { id: "justify", label: "Justify", icon: "M3 4h14M3 8h14M3 12h14M3 16h14" },
]

export const settingsSections = [
  { id: "profile", label: "Profile", description: "Your name, photo and public bio." },
  { id: "notifications", label: "Notifications", description: "Choose which emails and push alerts you receive." },
  { id: "billing", label: "Billing", description: "Update your card and download past invoices." },
  { id: "security", label: "Security", description: "Change your password and manage two-factor sign-in." },
]

export interface ListboxOption {
  label: string
  value: string
  src?: string | undefined
  description?: string | undefined
  group?: string | undefined
  disabled?: boolean | undefined
}

const amenities: ListboxOption[] = [
  { label: "Wi-Fi", value: "wifi" },
  { label: "Free parking", value: "parking" },
  { label: "Pool", value: "pool" },
  { label: "Gym", value: "gym" },
  { label: "Breakfast", value: "breakfast" },
  { label: "Pet friendly", value: "pets" },
  { label: "Air conditioning", value: "ac" },
  { label: "Kitchen", value: "kitchen" },
]

const timezones: ListboxOption[] = [
  { label: "Pacific Time", value: "America/Los_Angeles", description: "UTC−08:00", group: "Americas" },
  { label: "Eastern Time", value: "America/New_York", description: "UTC−05:00", group: "Americas" },
  { label: "São Paulo", value: "America/Sao_Paulo", description: "UTC−03:00", group: "Americas" },
  { label: "London", value: "Europe/London", description: "UTC+00:00", group: "Europe & Africa" },
  { label: "Paris", value: "Europe/Paris", description: "UTC+01:00", group: "Europe & Africa" },
  { label: "Lagos", value: "Africa/Lagos", description: "UTC+01:00", group: "Europe & Africa" },
  { label: "Dubai", value: "Asia/Dubai", description: "UTC+04:00", group: "Asia & Pacific" },
  { label: "Tokyo", value: "Asia/Tokyo", description: "UTC+09:00", group: "Asia & Pacific" },
  { label: "Sydney", value: "Australia/Sydney", description: "UTC+10:00", group: "Asia & Pacific" },
]

const shippingMethods: ListboxOption[] = [
  { label: "Standard", value: "standard", description: "5–7 business days · Free" },
  { label: "Express", value: "express", description: "2–3 business days · $9.99" },
  { label: "Overnight", value: "overnight", description: "Next business day · $24.99" },
  { label: "Same day", value: "same-day", description: "Not available in your area", disabled: true },
  { label: "Store pickup", value: "pickup", description: "Ready in 2 hours · Free" },
]

const notifications: ListboxOption[] = [
  { label: "Comments", value: "comments", description: "Replies to your posts and threads" },
  { label: "Mentions", value: "mentions", description: "When someone @mentions you" },
  { label: "New followers", value: "followers", description: "When someone follows you" },
  { label: "Releases", value: "releases", description: "New versions of projects you watch" },
  { label: "Security alerts", value: "security", description: "Vulnerabilities in your dependencies" },
  { label: "Weekly digest", value: "digest", description: "A summary of activity every Monday" },
]

const calendarViews: ListboxOption[] = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Year", value: "year" },
]

// photo ids and authors from picsum.photos
const photos: ListboxOption[] = [
  [41, "Nithya Ramanujam"],
  [42, "Luke Chesser"],
  [43, "Oleg Chursin"],
  [44, "Christopher Sardegna"],
  [45, "Alan Haverty"],
  [49, "Margaret Barley"],
  [50, "Tyler Wanlass"],
  [52, "Cierra"],
  [54, "Nicholas Swanson"],
].map(([id, author]) => ({
  label: String(author),
  value: `photo-${id}`,
  src: `https://picsum.photos/id/${id}/320/240`,
}))

export const listboxData = { amenities, timezones, shippingMethods, notifications, calendarViews, photos }

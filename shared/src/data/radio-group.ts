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

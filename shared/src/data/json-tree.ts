const webhookError = new Error("Webhook endpoint timed out after 5000ms")
webhookError.stack = "Error: Webhook endpoint timed out after 5000ms\n    at deliverWebhook (webhooks.ts:42:11)"

export const jsonTreeOrderResponse = {
  status: 200,
  requestId: "req_8f3a2c71",
  fetchedAt: new Date("2026-11-08T09:41:07Z"),
  order: {
    id: "ord_10482",
    state: "shipped",
    placedAt: new Date("2026-11-05T14:12:45Z"),
    total: 184.5,
    currency: "USD",
    receiptUrl: new URL("https://shop.example.com/orders/ord_10482/receipt"),
    customer: { id: "cus_2291", name: "Maya Okafor", email: "maya.okafor@example.com" },
    items: [
      { sku: "KB-75-ALU", name: "75% aluminum keyboard", quantity: 1, price: 139 },
      { sku: "KC-PBT-DUSK", name: "PBT keycap set", quantity: 1, price: 45.5 },
    ],
    boxes: [["KB-75-ALU", "foam-insert"], ["KC-PBT-DUSK"]],
    tags: new Set(["gift", "priority", "fragile"]),
    metadata: new Map<string, string>([
      ["channel", "web"],
      ["coupon", "WELCOME10"],
      ["warehouse", "rotterdam-2"],
    ]),
    lastWebhook: { event: "order.shipped", attemptedAt: new Date("2026-11-06T08:00:12Z"), error: webhookError },
  },
}

const levels = ["info", "info", "warn", "info", "error"] as const
const services = ["checkout", "search", "billing", "auth"] as const

export const jsonTreeLargeData = {
  export: "audit-log-2026-11-07",
  notes: "Exported from the production audit log for the incident review, covering every event that day.",
  total: 500,
  events: Array.from({ length: 500 }, (_, index) => ({
    id: `evt_${String(index + 1).padStart(4, "0")}`,
    service: services[index % services.length],
    level: levels[index % levels.length],
    message:
      index % 7 === 0 ? "Retrying the upstream request after a connection reset by the peer" : "Request completed",
  })),
}

type Account = { id: string; name: string; plan: string; owner?: Account; members?: unknown[] }

const workspace: Account = { id: "ws_204", name: "Northwind", plan: "team" }
workspace.owner = { id: "usr_17", name: "Priya Raman", plan: "team", members: [workspace] }
workspace.members = [
  { id: "usr_17", name: "Priya Raman", role: "owner" },
  { id: "usr_31", name: "Tomas Berg", role: "editor" },
]

export const jsonTreeCircularData = {
  workspace,
  self: undefined as unknown,
}
jsonTreeCircularData.self = jsonTreeCircularData

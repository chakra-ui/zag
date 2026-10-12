"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as steps from "@zag-js/steps"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/steps.css"

// Keep the URL readable instead of exposing `steps.COMPLETE`
const toSlug = (value: string | null) => (value === steps.COMPLETE ? "confirmation" : (value ?? "contact"))
const fromSlug = (slug: string | null) => (slug === "confirmation" ? steps.COMPLETE : (slug ?? "contact"))

function Checkout() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [digitalOnly, setDigitalOnly] = useState(false)

  const items: steps.StepItem[] = [
    { value: "contact", title: "Contact", invalid: !email.includes("@") },
    // Digital goods need no shipping
    { value: "shipping", title: "Shipping", invalid: !address.trim(), disabled: digitalOnly },
    { value: "payment", title: "Payment" },
  ]

  const service = useMachine(steps.machine, {
    id: useId(),
    items,
    linear: true,
    // The URL is the source of truth, so browser Back/Forward moves between steps
    value: fromSlug(searchParams.get("step")),
    onValueChange({ value }) {
      router.push(`${pathname}?step=${toSlug(value)}`)
    },
  })

  const api = steps.connect(service, normalizeProps)

  return (
    <>
      <main className="steps">
        <div {...api.getRootProps()}>
          <div {...api.getListProps()}>
            {api.items.map((item, index) => (
              <div key={item.value} {...api.getItemProps({ value: item.value })}>
                <button {...api.getTriggerProps({ value: item.value })}>
                  <div {...api.getIndicatorProps({ value: item.value })}>{index + 1}</div>
                  <span>{item.title}</span>
                </button>
                <div {...api.getSeparatorProps({ value: item.value })} />
              </div>
            ))}
          </div>

          <div {...api.getContentProps({ value: "contact" })} className="steps-form">
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label style={{ flexDirection: "row" }}>
              <input type="checkbox" checked={digitalOnly} onChange={(e) => setDigitalOnly(e.target.checked)} />
              My cart only has digital items
            </label>
          </div>

          <div {...api.getContentProps({ value: "shipping" })} className="steps-form">
            <label>
              Address
              <input value={address} onChange={(e) => setAddress(e.target.value)} />
            </label>
          </div>

          <div {...api.getContentProps({ value: "payment" })}>
            <p>Card ending in 4242</p>
          </div>

          <div {...api.getContentProps({ value: steps.COMPLETE })}>
            <p>Order placed. A receipt is on its way to {email}.</p>
          </div>

          {!api.complete && (
            <div className="steps-actions">
              <button {...api.getPrevTriggerProps()}>Back</button>
              <button {...api.getNextTriggerProps()}>{api.canComplete ? "Place order" : "Continue"}</button>
            </div>
          )}
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}

export default function Page() {
  return (
    <Suspense>
      <Checkout />
    </Suspense>
  )
}

"use client"

import * as accordion from "@zag-js/accordion"
import { normalizeProps, useMachine } from "@zag-js/react"
import { ArrowRight } from "lucide-react"
import { useId } from "react"
import "@styles/accordion.css"

const sections = [
  { value: "profile", title: "Profile", content: "Update your name, avatar, and the email shown to teammates." },
  {
    value: "notifications",
    title: "Notifications",
    content: "Choose which activity sends you an email or push alert.",
  },
  {
    value: "billing",
    title: "Billing",
    content: "Manage the plan, payment method, and invoices for this workspace.",
    disabled: true,
  },
  { value: "security", title: "Security", content: "Turn on two-factor authentication and review active sessions." },
]

export default function Page() {
  const service = useMachine(accordion.machine, {
    id: useId(),
    defaultValue: ["profile"],
  })

  const api = accordion.connect(service, normalizeProps)

  return (
    <main className="accordion">
      <div className="accordion-layout">
        <div {...api.getRootProps()}>
          {sections.map(({ value, title, content, disabled }) => (
            <div key={value} {...api.getItemProps({ value, disabled })}>
              <h3 {...api.getItemHeaderProps({ value, disabled })}>
                <button {...api.getItemTriggerProps({ value, disabled })}>
                  {title}
                  <span {...api.getItemIndicatorProps({ value, disabled })}>
                    <ArrowRight />
                  </span>
                </button>
              </h3>
              <div {...api.getItemContentProps({ value, disabled })}>
                <div className="accordion-item-body">{content}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="accordion-hint">Billing is disabled: only workspace admins can change it.</p>
      </div>
    </main>
  )
}

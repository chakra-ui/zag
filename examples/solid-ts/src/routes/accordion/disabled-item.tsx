import * as accordion from "@zag-js/accordion"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ArrowRight } from "lucide-solid"
import { createMemo, createUniqueId, For } from "solid-js"
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
    id: createUniqueId(),
    defaultValue: ["profile"],
  })

  const api = createMemo(() => accordion.connect(service, normalizeProps))

  return (
    <main class="accordion">
      <div class="accordion-layout">
        <div {...api().getRootProps()}>
          <For each={sections}>
            {({ value, title, content, disabled }) => (
              <div {...api().getItemProps({ value, disabled })}>
                <h3 {...api().getItemHeaderProps({ value, disabled })}>
                  <button {...api().getItemTriggerProps({ value, disabled })}>
                    {title}
                    <span {...api().getItemIndicatorProps({ value, disabled })}>
                      <ArrowRight />
                    </span>
                  </button>
                </h3>
                <div {...api().getItemContentProps({ value, disabled })}>
                  <div class="accordion-item-body">{content}</div>
                </div>
              </div>
            )}
          </For>
        </div>
        <p class="accordion-hint">Billing is disabled: only workspace admins can change it.</p>
      </div>
    </main>
  )
}

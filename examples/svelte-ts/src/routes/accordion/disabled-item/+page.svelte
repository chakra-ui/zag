<script lang="ts">
  import * as accordion from "@zag-js/accordion"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { ArrowRightIcon } from "lucide-svelte"
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

  const id = $props.id()
  const service = useMachine(accordion.machine, { id, defaultValue: ["profile"] })

  const api = $derived(accordion.connect(service, normalizeProps))
</script>

<main class="accordion">
  <div class="accordion-layout">
    <div {...api.getRootProps()}>
      {#each sections as { value, title, content, disabled } (value)}
        <div {...api.getItemProps({ value, disabled })}>
          <h3 {...api.getItemHeaderProps({ value, disabled })}>
            <button {...api.getItemTriggerProps({ value, disabled })}>
              {title}
              <span {...api.getItemIndicatorProps({ value, disabled })}><ArrowRightIcon /></span>
            </button>
          </h3>
          <div {...api.getItemContentProps({ value, disabled })}>
            <div class="accordion-item-body">{content}</div>
          </div>
        </div>
      {/each}
    </div>
    <p class="accordion-hint">Billing is disabled: only workspace admins can change it.</p>
  </div>
</main>

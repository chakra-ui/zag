import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createUniqueId } from "solid-js"
import { Portal } from "@solidjs/web"
import { Presence } from "~/components/presence"
import "@styles/popover-viewport.css"

const items = [
  { value: "notifications", title: "Notifications", description: "You are all caught up. Good job!" },
  { value: "activity", title: "Activity", description: "Nothing interesting happened recently." },
  {
    value: "profile",
    title: "Jason Eventon",
    description: "Pro plan. Manage your profile settings, billing and team.",
  },
]

const getItem = (value: string) => items.find((item) => item.value === value)!

export default function Page() {
  const service = useMachine(popover.machine, {
    id: createUniqueId(),
    positioning: { placement: "bottom" },
  })

  const api = createMemo(() => popover.connect(service, normalizeProps))

  return (
    <main class="popover animated-triggers">
      <div class="animated-triggers__list">
        <button {...api().getTriggerProps({ value: "notifications" })}>Notifications</button>
        <button {...api().getTriggerProps({ value: "activity" })}>Activity</button>
        <button {...api().getTriggerProps({ value: "profile" })}>Profile</button>
      </div>

      <Portal>
        <div {...api().getPositionerProps()}>
          <Presence {...api().getArrowProps()}>
            <div {...api().getArrowTipProps()} />
          </Presence>
          <Presence {...api().getViewportProps()}>
            <For each={api().getContentValues()}>
              {(value) => (
                <Presence {...api().getContentProps({ value })}>
                  <div {...api().getTitleProps({ value })}>{getItem(value).title}</div>
                  <p {...api().getDescriptionProps({ value })}>{getItem(value).description}</p>
                </Presence>
              )}
            </For>
          </Presence>
        </div>
      </Portal>
    </main>
  )
}

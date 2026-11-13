import * as popover from "@zag-js/popover"
import { normalizeProps, Portal, useMachine } from "@zag-js/preact"
import { useId } from "preact/hooks"
import { Presence } from "../../components/presence"
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
    id: useId(),
    positioning: { placement: "bottom" },
  })

  const api = popover.connect(service, normalizeProps)

  return (
    <main className="popover animated-triggers">
      <div className="animated-triggers__list">
        <button {...api.getTriggerProps({ value: "notifications" })}>Notifications</button>
        <button {...api.getTriggerProps({ value: "activity" })}>Activity</button>
        <button {...api.getTriggerProps({ value: "profile" })}>Profile</button>
      </div>

      <Portal>
        <div {...api.getPositionerProps()}>
          <Presence {...api.getArrowProps()}>
            <div {...api.getArrowTipProps()} />
          </Presence>
          <Presence {...api.getViewportProps()}>
            {api.getContentValues().map((value) => (
              <Presence key={value} {...api.getContentProps({ value })}>
                <div {...api.getTitleProps({ value })}>{getItem(value).title}</div>
                <p {...api.getDescriptionProps({ value })}>{getItem(value).description}</p>
              </Presence>
            ))}
          </Presence>
        </div>
      </Portal>
    </main>
  )
}

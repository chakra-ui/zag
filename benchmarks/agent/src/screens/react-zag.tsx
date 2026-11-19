import * as accordion from "@zag-js/accordion"
import * as dialog from "@zag-js/dialog"
import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import * as zagSwitch from "@zag-js/switch"
import * as tabs from "@zag-js/tabs"
import * as React from "react"
import { createRoot } from "react-dom/client"
import { channels, initialSettings, keepPanels, type Member, save, type Settings, visibilities } from "../settings"

const visibilityCollection = select.collection({ items: visibilities })

function Visibility(props: { value: string; onChange: (value: string) => void }) {
  const service = useMachine(select.machine, {
    id: React.useId(),
    collection: visibilityCollection,
    value: [props.value],
    onValueChange: (details) => props.onChange(details.value[0]),
  })
  const api = select.connect(service, normalizeProps)
  return (
    <div {...api.getRootProps()} className="field">
      <label {...api.getLabelProps()}>Visibility</label>
      <div {...api.getControlProps()}>
        <button {...api.getTriggerProps()} className="trigger">
          {api.valueAsString}
        </button>
      </div>
      <Portal>
        <div {...api.getPositionerProps()}>
          <ul {...api.getContentProps()} className="popup">
            {visibilityCollection.items.map((item) => (
              <li key={item.value} {...api.getItemProps({ item })} className="item">
                <span {...api.getItemTextProps({ item })}>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </Portal>
      <select {...api.getHiddenSelectProps()} />
    </div>
  )
}

function MemberActions(props: { member: Member; onToggleRole: () => void; onRemove: () => void }) {
  const { member } = props
  const service = useMachine(menu.machine, {
    id: React.useId(),
    onSelect: (details) => (details.value === "remove" ? props.onRemove() : props.onToggleRole()),
  })
  const api = menu.connect(service, normalizeProps)
  return (
    <>
      <button {...api.getTriggerProps()} className="button" aria-label={`Actions for ${member.name}`}>
        ⋯
      </button>
      <Portal>
        <div {...api.getPositionerProps()}>
          <ul {...api.getContentProps()} className="popup">
            <li {...api.getItemProps({ value: "role" })} className="item">
              {member.role === "admin" ? "Make member" : "Make admin"}
            </li>
            <li {...api.getItemProps({ value: "remove" })} className="item">
              Remove
            </li>
          </ul>
        </div>
      </Portal>
    </>
  )
}

function NotificationSwitch(props: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  const service = useMachine(zagSwitch.machine, {
    id: React.useId(),
    checked: props.checked,
    onCheckedChange: (details) => props.onChange(details.checked),
  })
  const api = zagSwitch.connect(service, normalizeProps)
  return (
    <label {...api.getRootProps()} className="choice">
      <input {...api.getHiddenInputProps()} />
      <span {...api.getControlProps()} className="switch">
        <span {...api.getThumbProps()} className="switch-thumb" />
      </span>
      <span {...api.getLabelProps()}>{props.label}</span>
    </label>
  )
}

function Notifications(props: {
  settings: Settings
  onChange: (channel: "email" | "slack", value: string, on: boolean) => void
}) {
  const service = useMachine(accordion.machine, { id: React.useId(), collapsible: true })
  const api = accordion.connect(service, normalizeProps)
  return (
    <div {...api.getRootProps()}>
      {channels.map((channel) => (
        <div key={channel.value} {...api.getItemProps({ value: channel.value })}>
          <button {...api.getItemTriggerProps({ value: channel.value })} className="button">
            {channel.label}
          </button>
          {(keepPanels || api.value.includes(channel.value)) && (
            <div {...api.getItemContentProps({ value: channel.value })} className="screen">
              {channel.notifications.map((item) => (
                <NotificationSwitch
                  key={item.value}
                  label={item.label}
                  checked={props.settings[channel.value][item.value]}
                  onChange={(on) => props.onChange(channel.value, item.value, on)}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function RemoveDialog(props: { member: Member | null; onClose: () => void; onConfirm: () => void }) {
  const service = useMachine(dialog.machine, {
    id: React.useId(),
    role: "alertdialog",
    open: props.member !== null,
    onOpenChange: (details) => !details.open && props.onClose(),
  })
  const api = dialog.connect(service, normalizeProps)
  if (!api.open) return null
  return (
    <Portal>
      <div {...api.getBackdropProps()} className="backdrop" />
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()} className="dialog">
          <h2 {...api.getTitleProps()}>Remove {props.member?.name}?</h2>
          <p {...api.getDescriptionProps()}>They lose access to this project right away.</p>
          <div className="row">
            <button {...api.getCloseTriggerProps()} className="button">
              Cancel
            </button>
            <button
              type="button"
              className="button"
              onClick={() => {
                props.onConfirm()
                api.setOpen(false)
              }}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </Portal>
  )
}

function Screen() {
  const [settings, setSettings] = React.useState(initialSettings)
  const [removing, setRemoving] = React.useState<Member | null>(null)
  const update = (patch: Partial<Settings>) => setSettings((current) => ({ ...current, ...patch }))
  const toggleRole = (id: string) =>
    setSettings((current) => ({
      ...current,
      members: current.members.map((member) =>
        member.id === id ? { ...member, role: member.role === "admin" ? "member" : "admin" } : member,
      ),
    }))

  const tabsService = useMachine(tabs.machine, { id: React.useId(), defaultValue: "general" })
  const tabsApi = tabs.connect(tabsService, normalizeProps)
  const nameId = React.useId()

  return (
    <main className="screen">
      <h1>Project settings</h1>
      <div {...tabsApi.getRootProps()}>
        <div {...tabsApi.getListProps()} className="row" aria-label="Settings">
          <button {...tabsApi.getTriggerProps({ value: "general" })}>General</button>
          <button {...tabsApi.getTriggerProps({ value: "members" })}>Members</button>
          <button {...tabsApi.getTriggerProps({ value: "notifications" })}>Notifications</button>
        </div>

        {(keepPanels || tabsApi.value === "general") && (
          <div {...tabsApi.getContentProps({ value: "general" })} className="screen">
            <div className="field">
              <label htmlFor={nameId}>Project name</label>
              <input id={nameId} value={settings.name} onChange={(event) => update({ name: event.target.value })} />
            </div>
            <Visibility value={settings.visibility} onChange={(visibility) => update({ visibility })} />
          </div>
        )}

        {(keepPanels || tabsApi.value === "members") && (
          <div {...tabsApi.getContentProps({ value: "members" })}>
            <ul className="members">
              {settings.members.map((member) => (
                <li key={member.id} className="row">
                  <span className="name">{member.name}</span>
                  <span>{member.role === "admin" ? "Admin" : "Member"}</span>
                  <MemberActions
                    member={member}
                    onToggleRole={() => toggleRole(member.id)}
                    onRemove={() => setRemoving(member)}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}

        {(keepPanels || tabsApi.value === "notifications") && (
          <div {...tabsApi.getContentProps({ value: "notifications" })}>
            <Notifications
              settings={settings}
              onChange={(channel, value, on) =>
                setSettings((current) => ({ ...current, [channel]: { ...current[channel], [value]: on } }))
              }
            />
          </div>
        )}
      </div>

      <RemoveDialog
        member={removing}
        onClose={() => setRemoving(null)}
        onConfirm={() =>
          setSettings((current) => ({
            ...current,
            members: current.members.filter((member) => member.id !== removing?.id),
          }))
        }
      />

      <button type="button" className="button" onClick={() => save(settings)}>
        Save settings
      </button>
    </main>
  )
}

function mount(root: HTMLElement) {
  createRoot(root).render(<Screen />)
}

export { mount }

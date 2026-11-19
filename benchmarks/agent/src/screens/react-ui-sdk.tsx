import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from "@ui-sdk/react/accordion"
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@ui-sdk/react/alert-dialog"
import { Button } from "@ui-sdk/react/button"
import { Field, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@ui-sdk/react/menu"
import { Select, SelectContent, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@ui-sdk/react/select"
import { Switch, SwitchThumb } from "@ui-sdk/react/switch"
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"
import * as React from "react"
import { createRoot } from "react-dom/client"
import { channels, initialSettings, keepPanels, type Member, save, type Settings, visibilities } from "../settings"

function Screen() {
  const [settings, setSettings] = React.useState(initialSettings)
  const [removing, setRemoving] = React.useState<Member | null>(null)
  const update = (patch: Partial<Settings>) => setSettings((current) => ({ ...current, ...patch }))
  const toggleRole = (id: string) =>
    update({
      members: settings.members.map((member) =>
        member.id === id ? { ...member, role: member.role === "admin" ? "member" : "admin" } : member,
      ),
    })

  return (
    <main className="screen">
      <h1>Project settings</h1>
      <Tabs defaultValue="general">
        <TabsList className="row" aria-label="Settings">
          <TabsTab value="general">General</TabsTab>
          <TabsTab value="members">Members</TabsTab>
          <TabsTab value="notifications">Notifications</TabsTab>
        </TabsList>

        <TabsPanel value="general" className="screen" keepMounted={keepPanels}>
          <Field className="field">
            <FieldLabel>Project name</FieldLabel>
            <Input value={settings.name} onValueChange={(name) => update({ name })} />
          </Field>
          <Select
            items={visibilities}
            value={settings.visibility}
            onValueChange={(value) => update({ visibility: value as string })}
          >
            <div className="field">
              <SelectLabel>Visibility</SelectLabel>
              <SelectTrigger className="trigger">
                <SelectValue />
              </SelectTrigger>
            </div>
            <SelectContent className="popup">
              {visibilities.map((item) => (
                <SelectItem key={item.value} value={item.value} className="item">
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TabsPanel>

        <TabsPanel value="members" keepMounted={keepPanels}>
          <ul className="members">
            {settings.members.map((member) => (
              <li key={member.id} className="row">
                <span className="name">{member.name}</span>
                <span>{member.role === "admin" ? "Admin" : "Member"}</span>
                <Menu onAction={(action) => (action === "remove" ? setRemoving(member) : toggleRole(member.id))}>
                  <MenuTrigger className="button" aria-label={`Actions for ${member.name}`}>
                    ⋯
                  </MenuTrigger>
                  <MenuContent className="popup">
                    <MenuItem value="role" className="item">
                      {member.role === "admin" ? "Make member" : "Make admin"}
                    </MenuItem>
                    <MenuItem value="remove" className="item">
                      Remove
                    </MenuItem>
                  </MenuContent>
                </Menu>
              </li>
            ))}
          </ul>
        </TabsPanel>

        <TabsPanel value="notifications" keepMounted={keepPanels}>
          <Accordion keepMounted={keepPanels}>
            {channels.map((channel) => (
              <AccordionItem key={channel.value} value={channel.value}>
                <AccordionHeader>
                  <AccordionTrigger className="button">{channel.label}</AccordionTrigger>
                </AccordionHeader>
                <AccordionPanel className="screen">
                  {channel.notifications.map((item) => (
                    <label key={item.value} className="choice">
                      <Switch
                        className="switch"
                        checked={settings[channel.value][item.value]}
                        onCheckedChange={(on) =>
                          update({
                            [channel.value]: {
                              ...settings[channel.value],
                              [item.value]: on,
                            },
                          })
                        }
                      >
                        <SwitchThumb className="switch-thumb" />
                      </Switch>
                      {item.label}
                    </label>
                  ))}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsPanel>
      </Tabs>

      <AlertDialog open={removing !== null} onOpenChange={(open) => !open && setRemoving(null)}>
        <AlertDialogBackdrop className="backdrop" />
        <AlertDialogContent className="dialog">
          <AlertDialogTitle>Remove {removing?.name}?</AlertDialogTitle>
          <AlertDialogDescription>They lose access to this project right away.</AlertDialogDescription>
          <div className="row">
            <AlertDialogClose className="button">Cancel</AlertDialogClose>
            <AlertDialogClose
              className="button"
              onClick={() =>
                update({
                  members: settings.members.filter((member) => member.id !== removing?.id),
                })
              }
            >
              Remove
            </AlertDialogClose>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <Button className="button" onClick={() => save(settings)}>
        Save settings
      </Button>
    </main>
  )
}

function mount(root: HTMLElement) {
  createRoot(root).render(<Screen />)
}

export { mount }

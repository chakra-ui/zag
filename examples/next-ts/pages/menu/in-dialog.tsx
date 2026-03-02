import * as dialog from "@zag-js/dialog"
import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { menuData } from "@zag-js/shared"
import { useId } from "react"
import { useEffectOnce } from "../../hooks/use-effect-once"

function NestedMenu() {
  const service = useMachine(menu.machine, {
    id: useId(),
  })
  const root = menu.connect(service, normalizeProps)

  const subService = useMachine(menu.machine, { id: useId() })
  const sub = menu.connect(subService, normalizeProps)

  const sub2Service = useMachine(menu.machine, { id: useId() })
  const sub2 = menu.connect(sub2Service, normalizeProps)

  useEffectOnce(() => {
    root.setChild(subService)
    sub.setParent(service)
  })

  useEffectOnce(() => {
    sub.setChild(sub2Service)
    sub2.setParent(subService)
  })

  const triggerItemProps = root.getTriggerItemProps(sub)
  const triggerItem2Props = sub.getTriggerItemProps(sub2)

  const [level1, level2, level3] = menuData

  return (
    <div>
      <button {...root.getTriggerProps()}>Options Menu</button>

      {root.open && (
        <Portal>
          <div {...root.getPositionerProps()}>
            <ul {...root.getContentProps()}>
              {level1.map((item) => {
                const props = item.trigger ? triggerItemProps : root.getItemProps({ value: item.value })
                return (
                  <li key={item.value} {...props}>
                    {item.label}
                  </li>
                )
              })}
            </ul>
          </div>
        </Portal>
      )}

      {sub.open && (
        <Portal>
          <div {...sub.getPositionerProps()}>
            <ul {...sub.getContentProps()}>
              {level2.map((item) => {
                const props = item.trigger ? triggerItem2Props : sub.getItemProps({ value: item.value })
                return (
                  <li key={item.value} {...props}>
                    {item.label}
                  </li>
                )
              })}
            </ul>
          </div>
        </Portal>
      )}

      {sub2.open && (
        <Portal>
          <div {...sub2.getPositionerProps()}>
            <ul {...sub2.getContentProps()}>
              {level3.map((item) => (
                <li key={item.value} {...sub2.getItemProps({ value: item.value })}>
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </Portal>
      )}
    </div>
  )
}

export default function Page() {
  const service = useMachine(dialog.machine, { id: useId() })
  const api = dialog.connect(service, normalizeProps)

  return (
    <div style={{ padding: "20px" }}>
      <button {...api.getTriggerProps()} data-testid="trigger-1">
        Open Dialog with Nested Menu
      </button>
      {api.open && (
        <Portal>
          <div {...api.getBackdropProps()} />
          <div data-testid="positioner-1" {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <h2 {...api.getTitleProps()}>Dialog with Nested Menu</h2>
              <p {...api.getDescriptionProps()}>
                This dialog contains a menu with multiple nested submenus. The focus trap should include all menu
                levels, even though they are portalled.
              </p>
              <div style={{ marginTop: "20px" }}>
                <NestedMenu />
              </div>
              <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button {...api.getCloseTriggerProps()}>Close</button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}

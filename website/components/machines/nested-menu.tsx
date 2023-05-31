import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import { panda } from "styled-system/jsx"
import { Button } from "components/button"
import { useEffect } from "react"

const data = [
  { label: "New tab", value: "new-tab" },
  { label: "New window", value: "new-window" },
  { label: "Print ...", value: "print" },
  { label: "Help", value: "help" },
]

const shareMenuData = [
  { label: "Messages", value: "messages" },
  { label: "Airdrop", value: "airdrop" },
  { label: "WhatsApp", value: "whatsapp" },
]

export function NestedMenu() {
  // Level 1 - File Menu
  const [fileMenuState, fileMenuSend, fileMenuMachine] = useMachine(
    menu.machine({ id: "1", "aria-label": "File" }),
  )

  const fileMenu = menu.connect(fileMenuState, fileMenuSend, normalizeProps)

  // Level 2 - Share Menu
  const [shareMenuState, shareMenuSend, shareMenuMachine] = useMachine(
    menu.machine({ id: "2", "aria-label": "Share" }),
  )

  const shareMenu = menu.connect(shareMenuState, shareMenuSend, normalizeProps)

  useEffect(() => {
    setTimeout(() => {
      fileMenu.setChild(shareMenuMachine)
      shareMenu.setParent(fileMenuMachine)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Share menu trigger
  const shareMenuTriggerProps = fileMenu.getTriggerItemProps(shareMenu)

  return (
    <div>
      <Button size="sm" variant="green" {...fileMenu.triggerProps}>
        Click me
        <panda.span ml="2" aria-hidden>
          ▾
        </panda.span>
      </Button>

      <Portal>
        <div {...fileMenu.positionerProps}>
          <panda.ul
            bg="bg-subtle"
            width="240px"
            padding="2"
            isolation="isolate"
            listStyleType="none"
            shadow="base"
            className="focus-outline"
            {...fileMenu.contentProps}
          >
            {data.map((item) => (
              <panda.li
                px="2"
                py="1"
                cursor="pointer"
                key={item.value}
                _focus={{
                  bg: "bg-primary-bold",
                  color: "white",
                }}
                {...fileMenu.getItemProps({ id: item.value })}
              >
                {item.label}
              </panda.li>
            ))}
            <panda.li
              px="2"
              py="1"
              cursor="pointer"
              _focus={{
                bg: "bg-primary-bold",
                color: "white",
              }}
              {...shareMenuTriggerProps}
            >
              Share
              <panda.span ml="2" aria-hidden>
                »
              </panda.span>
            </panda.li>
          </panda.ul>
        </div>
      </Portal>

      <Portal>
        <div {...shareMenu.positionerProps}>
          <panda.ul
            bg="bg-subtle"
            width="240px"
            padding="2"
            isolation="isolate"
            listStyleType="none"
            shadow="base"
            className="focus-outline"
            {...shareMenu.contentProps}
          >
            {shareMenuData.map((item) => (
              <panda.li
                px="2"
                py="1"
                cursor="pointer"
                key={item.value}
                _focus={{
                  bg: "bg-primary-bold",
                  color: "white",
                }}
                {...shareMenu.getItemProps({ id: item.value })}
              >
                {item.label}
              </panda.li>
            ))}
          </panda.ul>
        </div>
      </Portal>
    </div>
  )
}

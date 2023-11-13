import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import { chakra } from "@chakra-ui/system"
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
        <chakra.span ml="2" {...fileMenu.indicatorProps}>
          ▾
        </chakra.span>
      </Button>

      <Portal>
        <div {...fileMenu.positionerProps}>
          <chakra.ul
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
              <chakra.li
                px="2"
                py="1"
                cursor="pointer"
                key={item.value}
                _highlighted={{
                  bg: "bg-primary-bold",
                  color: "white",
                }}
                {...fileMenu.getItemProps({ id: item.value })}
              >
                {item.label}
              </chakra.li>
            ))}
            <chakra.li
              px="2"
              py="1"
              cursor="pointer"
              _highlighted={{
                bg: "bg-primary-bold",
                color: "white",
              }}
              {...shareMenuTriggerProps}
            >
              Share
              <chakra.span ml="2" {...shareMenu.indicatorProps}>
                »
              </chakra.span>
            </chakra.li>
          </chakra.ul>
        </div>
      </Portal>

      <Portal>
        <div {...shareMenu.positionerProps}>
          <chakra.ul
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
              <chakra.li
                px="2"
                py="1"
                cursor="pointer"
                key={item.value}
                _highlighted={{
                  bg: "bg-primary-bold",
                  color: "white",
                }}
                {...shareMenu.getItemProps({ id: item.value })}
              >
                {item.label}
              </chakra.li>
            ))}
          </chakra.ul>
        </div>
      </Portal>
    </div>
  )
}

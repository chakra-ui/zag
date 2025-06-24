import { Icon } from "@chakra-ui/icon"
import { Badge, Box, HStack, Stack } from "@chakra-ui/layout"
import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import packageJson from "@zag-js/react/package.json"
import Link from "next/link"
import { useId } from "react"
import { HiChevronDown } from "react-icons/hi"

export const VersionSelector = () => {
  const service = useMachine(menu.machine, {
    id: useId(),
  })

  const api = menu.connect(service, normalizeProps)

  return (
    <>
      <Badge
        variant="subtle"
        color="text-badge!"
        bg="bg-badge!"
        rounded="sm"
        fontSize="xs"
        px="2!"
        letterSpacing="wider"
        fontWeight="semibold"
        display={{ base: "none", sm: "flex" }}
        gap="1"
        borderBottomColor="border-subtle"
        as="button"
        {...api.getTriggerProps()}
      >
        {items[0].label}
        <Icon as={HiChevronDown} fontSize="md" />
      </Badge>

      {api.open && (
        <Portal>
          <div {...api.getPositionerProps()}>
            <Stack
              width="180px!"
              zIndex="1000"
              fontSize="sm!"
              {...api.getContentProps()}
            >
              {items.map((item) => (
                <Link
                  key={item.value}
                  href={item.value}
                  {...api.getItemProps({ value: item.value })}
                >
                  <HStack justify="space-between">
                    <Box>{item.tag}</Box>
                    <Box opacity="0.64">{item.label}</Box>
                  </HStack>
                </Link>
              ))}
            </Stack>
          </div>
        </Portal>
      )}
    </>
  )
}

const items = [
  {
    label: packageJson.version,
    value: "https://zagjs.com",
    tag: "v1",
  },
  {
    label: "0.82.x",
    value: "https://v0.zagjs.com",
    tag: "v0",
  },
]

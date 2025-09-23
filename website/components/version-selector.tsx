import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import packageJson from "@zag-js/react/package.json"
import { Icon } from "components/ui/icon"
import Link from "next/link"
import { useId } from "react"
import { HiChevronDown } from "react-icons/hi"
import { css } from "styled-system/css"
import { Box, HStack, Stack, styled } from "styled-system/jsx"

export const VersionSelector = () => {
  const service = useMachine(menu.machine, {
    id: useId(),
    positioning: {
      strategy: "fixed",
    },
  })

  const api = menu.connect(service, normalizeProps)

  return (
    <>
      <styled.button
        display={{ base: "none", sm: "flex" }}
        alignItems="center"
        gap="1"
        borderWidth="1px"
        rounded="sm"
        fontSize="xs"
        px="2"
        py="1"
        letterSpacing="wider"
        fontWeight="semibold"
        cursor="pointer"
        {...api.getTriggerProps()}
      >
        {items[0].label}
        <Icon as={HiChevronDown} fontSize="md" />
      </styled.button>

      {api.open && (
        <Portal>
          <div {...api.getPositionerProps()}>
            <Stack
              width="180px"
              zIndex="1000"
              fontSize="sm"
              bg="bg"
              padding="2"
              isolation="isolate"
              listStyleType="none"
              boxShadow="md"
              outline="0"
              {...api.getContentProps()}
            >
              {items.map((item) => (
                <Link
                  key={item.value}
                  href={item.value}
                  {...api.getItemProps({ value: item.value })}
                  className={css({
                    px: "0.5rem",
                    py: "0.25rem",
                    cursor: "pointer",
                    _highlighted: {
                      bg: "bg.primary.bold",
                      color: "white",
                    },
                  })}
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

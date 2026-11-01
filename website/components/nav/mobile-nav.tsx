import * as dialog from "@zag-js/dialog"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import * as tabs from "@zag-js/tabs"
import { Button } from "components/ui/button"
import { Icon } from "components/ui/icon"
import { getActiveTab } from "lib/pagination-utils"
import { useRouteChange } from "lib/use-route-change"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { HiMenu, HiX } from "react-icons/hi"
import { tabs as docsTabs } from "sidebar.config"
import { Box, Flex, HStack, Spacer, Stack, styled } from "styled-system/jsx"
import useMatchMedia from "use-match-media-hook"
import { FrameworkSelect } from "../framework-select"
import { LogoWithLink } from "../logo"
import { Sidebar } from "../sidebar"
import { NavLinks } from "./nav-links"
import { VersionSelect } from "./version-select"

export function MobileNav() {
  const service = useMachine(dialog.machine, {
    id: "m1",
    initialFocusEl: () => initialRef.current,
  })

  const api = dialog.connect(service, normalizeProps)
  const initialRef = useRef<HTMLButtonElement | null>(null)

  const [desktop] = useMatchMedia([`(min-width: 1024px)`])

  useEffect(() => {
    if (desktop) api.setOpen(false)
  }, [desktop])

  useRouteChange(() => {
    api.setOpen(false)
  })

  return (
    <>
      <Button
        display={{ base: "inline-flex", lg: "none" }}
        size="sm"
        px="2"
        bg="bg.subtle"
        aria-label="Menu"
        {...api.getTriggerProps()}
      >
        <HStack>
          <HiMenu />{" "}
          <styled.span display={{ base: "none", sm: "inline" }}>
            Menu
          </styled.span>
        </HStack>
      </Button>

      {api.open && (
        <Portal>
          <div {...api.getPositionerProps()}>
            <Box
              {...api.getContentProps()}
              position="fixed"
              inset="0"
              zIndex="100"
              pb="10"
              overflowY="auto"
              bg="bg.subtle"
            >
              <Flex
                justify="space-between"
                py="4"
                px={{ base: "4", sm: "6", md: "8" }}
              >
                <HStack gap="3">
                  <LogoWithLink />
                  <VersionSelect />
                </HStack>
                <Button
                  ref={initialRef}
                  size="sm"
                  px="2"
                  bg="bg.subtle"
                  {...api.getCloseTriggerProps()}
                >
                  <HStack>
                    <HiX /> <span>Close</span>
                  </HStack>
                </Button>
              </Flex>

              <Box px="8">
                <Spacer height="10" bg="transparent" />
                <Stack gap="3" mb="8">
                  <FrameworkSelect />
                  <NavLinks />
                </Stack>
                <MobileDocsTabs />
              </Box>
            </Box>
          </div>
        </Portal>
      )}
    </>
  )
}

/** Pick a docs section, then browse its sidebar, without leaving the page */
function MobileDocsTabs() {
  const pathname = usePathname()
  const service = useMachine(tabs.machine, {
    id: "mobile-docs-tabs",
    defaultValue: getActiveTab(pathname).id,
  })
  const api = tabs.connect(service, normalizeProps)

  return (
    <Box {...api.getRootProps()}>
      <HStack
        {...api.getListProps()}
        gap="1"
        mb="6"
        pb="2"
        flexWrap="wrap"
        borderBottomWidth="1px"
        borderBottomColor="border.subtle"
      >
        {docsTabs.map((tab) => (
          <styled.button
            key={tab.id}
            display="inline-flex"
            alignItems="center"
            gap="2"
            px="3"
            py="1.5"
            rounded="md"
            fontSize="sm"
            fontWeight="medium"
            color="text.muted"
            flexShrink="0"
            _selected={{
              color: "text",
              bg: "bg.muted",
              fontWeight: "semibold",
            }}
            _focusVisible={{
              outline: "2px solid",
              outlineColor: "green.500",
            }}
            {...api.getTriggerProps({ value: tab.id })}
          >
            <Icon as={tab.icon} />
            {tab.label}
          </styled.button>
        ))}
      </HStack>
      {docsTabs.map((tab) => (
        <Box key={tab.id} {...api.getContentProps({ value: tab.id })}>
          <Sidebar tabId={tab.id} />
        </Box>
      ))}
    </Box>
  )
}

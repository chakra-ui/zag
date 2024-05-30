import { Box, Flex, HStack, Spacer } from "@chakra-ui/layout"
import { chakra, useToken } from "@chakra-ui/system"
import * as dialog from "@zag-js/dialog"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { useRouteChange } from "lib/use-route-change"
import { useEffect, useRef } from "react"
import { HiMenu, HiX } from "react-icons/hi"
import useMatchMedia from "use-match-media-hook"
import { Button } from "./button"
import { FrameworkSelect } from "./framework-select"
import { LogoWithLink } from "./logo"
import { Sidebar } from "./sidebar"

export function MobileNavigation() {
  const [state, send] = useMachine(
    dialog.machine({
      id: "m1",
      initialFocusEl: () => initialRef.current,
    }),
  )

  const api = dialog.connect(state, send, normalizeProps)
  const initialRef = useRef<HTMLButtonElement>(null)

  const lgBreakpoint = useToken("breakpoints", "lg")
  const [desktop] = useMatchMedia([`(min-width: ${lgBreakpoint})`])

  useEffect(() => {
    if (desktop) api.setOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        bg="bg-subtle"
        {...api.getTriggerProps()}
      >
        <HStack>
          <HiMenu />{" "}
          <chakra.span display={{ base: "none", xs: "inline" }}>
            Menu
          </chakra.span>
        </HStack>
      </Button>

      {api.open && (
        <Portal>
          <div {...api.getPositionerProps()}>
            <Box
              {...api.getContentProps()}
              position="fixed"
              inset="0"
              zIndex="modal"
              pb="10"
              overflowY="auto"
              bg="bg-subtle"
            >
              <Flex
                justify="space-between"
                py="4"
                px={{ base: "4", sm: "6", md: "8" }}
              >
                <LogoWithLink />
                <Button
                  ref={initialRef}
                  size="sm"
                  px="2"
                  bg="bg-subtle"
                  {...api.getCloseTriggerProps()}
                >
                  <HStack>
                    <HiX /> <span>Close</span>
                  </HStack>
                </Button>
              </Flex>
              <Box px="8">
                <Spacer height="10" bg="transparent" />
                <Box mb="8">
                  <FrameworkSelect />
                </Box>
                <Sidebar />
              </Box>
            </Box>
          </div>
        </Portal>
      )}
    </>
  )
}

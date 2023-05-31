import { Flex, Stack } from "styled-system/jsx"
import { panda } from "styled-system/jsx"
import * as hoverCard from "@zag-js/hover-card"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import { useId } from "react"

type HoverCardProps = {
  controls: {
    openDelay: number
    closeDelay: number
  }
}

export function HoverCard(props: HoverCardProps) {
  const [state, send] = useMachine(hoverCard.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = hoverCard.connect(state, send, normalizeProps)

  return (
    <div>
      <panda.a
        href="https://twitter.com/zag_js"
        target="_blank"
        rel="noreferrer noopener"
        {...api.triggerProps}
      >
        <panda.img
          alt="Twitter"
          src="/favicon/apple-touch-icon.png"
          height="12"
          width="12"
          shadow="xl"
        />
      </panda.a>

      {api.isOpen && (
        <Portal>
          <div {...api.positionerProps}>
            <panda.div
              bg="bg-subtle"
              padding="4"
              borderWidth="1px"
              filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 15%))"
              zIndex="50"
              position="relative"
              maxW="min(calc(100vw - 16px), 360px)"
              width="full"
              {...api.contentProps}
            >
              <panda.div
                sx={{
                  "--arrow-background": "bg-subtle",
                  "--arrow-size": "8px",
                }}
                {...api.arrowProps}
              >
                <panda.div rounded="sm" {...api.arrowTipProps} />
              </panda.div>
              <Stack gap="3">
                <panda.img
                  alt="Twitter"
                  src="/favicon/apple-touch-icon.png"
                  height="14"
                  width="14"
                />
                <Stack gap="4">
                  <p>
                    <panda.p fontWeight="bold">Zag JS</panda.p>
                    <panda.p color="gray.500"> @zag_js</panda.p>
                  </p>
                  <p>
                    <p>UI components powered by Finite State Machines.</p>
                    Created by{" "}
                    <panda.a
                      href="https://twitter.com/thesegunadebayo"
                      target="_blank"
                      rel="noreferrer noopener"
                      color="royalblue"
                    >
                      @thesegunadebayo
                    </panda.a>
                  </p>
                  <Flex gap="4">
                    <Flex gap="1.5">
                      <panda.p fontWeight="bold">2</panda.p>{" "}
                      <panda.p color="gray.500">Following</panda.p>
                    </Flex>
                    <Flex gap="1.5">
                      <panda.p fontWeight="bold">4,000</panda.p>{" "}
                      <panda.p color="gray.500">Followers</panda.p>
                    </Flex>
                  </Flex>
                </Stack>
              </Stack>
            </panda.div>
          </div>
        </Portal>
      )}
    </div>
  )
}

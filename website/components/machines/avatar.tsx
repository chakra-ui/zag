/* eslint-disable @next/next/no-img-element */
import { chakra } from "@chakra-ui/system"
import { Center, Circle } from "@chakra-ui/layout"
import * as avatar from "@zag-js/avatar"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

export function Avatar(props: { controls: { src: string; name: string } }) {
  const { src, name } = props.controls

  const [state, send] = useMachine(avatar.machine({ id: useId() }))
  const api = avatar.connect(state, send, normalizeProps)

  const initial = name
    .split(" ")
    .map((s) => s[0])
    .join("")

  return (
    <>
      <main className="avatar">
        <Circle size="80px" overflow="hidden" {...api.rootProps}>
          <chakra.div
            width="80px"
            height="80px"
            fontSize="sm"
            lineHeight="1"
            fontWeight="semibold"
            color="white"
            bg="gray.500"
            {...api.fallbackProps}
          >
            <Center width="full" height="full">
              {initial}
            </Center>
          </chakra.div>
          <chakra.img
            width="80px"
            height="80px"
            objectFit="cover"
            borderRadius="9999px"
            alt={name}
            referrerPolicy="no-referrer"
            src={src}
            {...api.imageProps}
          />
        </Circle>
      </main>
    </>
  )
}

import { Center, HStack } from "styled-system/jsx"
import { panda } from "styled-system/jsx"
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import { Button } from "components/button"
import { useId } from "react"
import { icon } from "styled-system/recipes"

export function Dialog(props: { controls: any }) {
  const [state, send] = useMachine(dialog.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = dialog.connect(state, send, normalizeProps)

  return (
    <>
      {/* @ts-expect-error */}
      <Button size="sm" variant="green" {...api.triggerProps}>
        Open Dialog
      </Button>
      {api.isOpen && (
        <Portal>
          <panda.div
            position="fixed"
            inset="0"
            bg="blackAlpha.600"
            zIndex="modal"
          />
          <Center
            height="100vh"
            width="100vw"
            position="fixed"
            zIndex="modal"
            inset="0"
            {...api.containerProps}
          >
            <panda.div
              width="full"
              maxW="400px"
              rounded="md"
              bg="bg-subtle"
              padding="5"
              position="relative"
              pointerEvents="auto"
              {...api.contentProps}
            >
              <panda.h2
                fontWeight="semibold"
                fontSize="lg"
                mb="2"
                {...api.titleProps}
              >
                Edit profile
              </panda.h2>
              <panda.p fontSize="sm" mb="3" {...api.descriptionProps}>
                Make changes to your profile here. Click save when you are done.
              </panda.p>

              <HStack>
                <panda.input
                  flex="1"
                  fontSize="sm"
                  borderWidth="1px"
                  px="2"
                  py="1"
                  placeholder="Enter name..."
                />
                <Button variant="green" size="sm">
                  Save
                </Button>
              </HStack>
              <panda.button
                display="flex"
                position="absolute"
                top="3"
                right="3"
                {...api.closeTriggerProps}
              >
                <panda.span className={icon({ name: "heroicons-outline:x" })} />
              </panda.button>
            </panda.div>
          </Center>
        </Portal>
      )}
    </>
  )
}

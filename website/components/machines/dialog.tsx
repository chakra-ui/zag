import Icon from "@chakra-ui/icon"
import { Center, HStack } from "@chakra-ui/layout"
import { chakra } from "@chakra-ui/system"
import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import { Button } from "components/button"
import { HiX } from "react-icons/hi"
import { useId } from "react"

export function Dialog(props: { controls: any }) {
  const [state, send] = useMachine(dialog.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = dialog.connect(state, send, normalizeProps)

  return (
    <>
      <Button size="sm" variant="green" {...api.triggerProps}>
        Open Dialog
      </Button>
      {api.isOpen && (
        <Portal>
          <chakra.div
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
            <chakra.div
              width="full"
              maxW="400px"
              rounded="md"
              bg="bg-subtle"
              padding="5"
              position="relative"
              pointerEvents="auto"
              {...api.contentProps}
            >
              <chakra.h2
                fontWeight="semibold"
                fontSize="lg"
                mb="2"
                {...api.titleProps}
              >
                Edit profile
              </chakra.h2>
              <chakra.p fontSize="sm" mb="3" {...api.descriptionProps}>
                Make changes to your profile here. Click save when you are done.
              </chakra.p>

              <HStack>
                <chakra.input
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
              <chakra.button
                display="flex"
                position="absolute"
                top="3"
                right="3"
                {...api.closeTriggerProps}
              >
                <Icon as={HiX} />
              </chakra.button>
            </chakra.div>
          </Center>
        </Portal>
      )}
    </>
  )
}

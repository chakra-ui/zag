import { HStack, Stack, VStack } from "@chakra-ui/layout"
import { chakra } from "@chakra-ui/system"
import * as filePicker from "@zag-js/file-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { Button } from "components/button"
import { useId } from "react"
import { HiX } from "react-icons/hi"

export function filePicker(props: { controls: any }) {
  const [state, send] = useMachine(
    filePicker.machine({
      id: useId(),
    }),
    { context: props.controls },
  )

  const api = filePicker.connect(state, send, normalizeProps)

  return (
    <Stack width="80%" {...api.rootProps}>
      <VStack
        borderWidth="2px"
        borderStyle="dashed"
        py="8"
        px="2"
        _focus={{ shadow: "outline" }}
        sx={{
          "&[data-dragging]": { bg: "bg-bold" },
        }}
        {...api.dropzoneProps}
      >
        <input {...api.hiddenInputProps} />
        <span>Drag your files here</span>
        <Button size="sm" variant="green" {...api.triggerProps}>
          Open Dialog
        </Button>
      </VStack>

      <Stack>
        {api.files.map((file) => (
          <HStack
            key={file.name}
            px="3"
            py="2"
            bg="bg-subtle"
            borderWidth="1px"
          >
            <chakra.div flex="1" fontSize="sm">
              {file.name}
            </chakra.div>
            <button {...api.getDeleteTriggerProps({ file })}>
              <HiX />
            </button>
          </HStack>
        ))}
      </Stack>
    </Stack>
  )
}

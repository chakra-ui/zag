import * as editable from "@zag-js/editable"
import { normalizeProps, useMachine } from "@zag-js/react"
import { chakra } from "@chakra-ui/system"
import { HStack } from "@chakra-ui/layout"
import { Button } from "components/button"
import { useId } from "react"

export function Editable(props: any) {
  const [state, send] = useMachine(editable.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = editable.connect(state, send, normalizeProps)

  return (
    <chakra.div width="300px" {...api.rootProps}>
      <chakra.div mb="3" {...api.areaProps}>
        <chakra.input
          className="focus-outline"
          bg="transparent"
          {...api.inputProps}
        />
        <span {...api.previewProps} />
      </chakra.div>

      <div>
        {!api.isEditing && (
          <Button
            size="sm"
            variant="outline"
            bg="bg-subtle"
            {...api.editTriggerProps}
          >
            Edit
          </Button>
        )}
        {api.isEditing && (
          <HStack>
            <Button size="sm" variant="green" {...api.submitTriggerProps}>
              Save
            </Button>
            <Button size="sm" variant="outline" {...api.cancelTriggerProps}>
              Cancel
            </Button>
            Button
          </HStack>
        )}
      </div>
    </chakra.div>
  )
}

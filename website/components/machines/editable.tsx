import * as editable from "@zag-js/editable"
import { normalizeProps, useMachine } from "@zag-js/react"
import { panda } from "styled-system/jsx"
import { HStack } from "styled-system/jsx"
import { Button } from "components/button"
import { useId } from "react"

export function Editable(props: any) {
  const [state, send] = useMachine(editable.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = editable.connect(state, send, normalizeProps)

  return (
    <panda.div width="300px" {...api.rootProps}>
      <panda.div mb="3" {...api.areaProps}>
        <panda.input
          className="focus-outline"
          bg="transparent"
          {...api.inputProps}
        />
        <span {...api.previewProps} />
      </panda.div>

      <div>
        {!api.isEditing && (
          // @ts-expect-error
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
            {/* @ts-expect-error */}
            <Button size="sm" variant="green" {...api.submitTriggerProps}>
              Save
            </Button>
            {/* @ts-expect-error */}
            <Button size="sm" variant="outline" {...api.cancelTriggerProps}>
              Cancel
            </Button>
            Button
          </HStack>
        )}
      </div>
    </panda.div>
  )
}

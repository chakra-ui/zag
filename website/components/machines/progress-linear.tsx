import { HStack, Stack } from "@chakra-ui/layout"
import { chakra, keyframes } from "@chakra-ui/system"
import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/react"
import { Button } from "components/button"
import { useId } from "react"

const Track = chakra("div", {
  baseStyle: {
    borderWidth: "1px",
    height: "20px",
    rounded: "sm",
    bg: "bg-subtle",
    overflow: "hidden",
  },
})

const animation = keyframes({
  from: { transform: "scaleX(1) translateX(var(--translate-x))" },
  to: { transform: "scaleX(0) translateX(var(--translate-x))" },
})

const Range = chakra("div", {
  baseStyle: {
    "--translate-x": "-100%",
    height: "100%",
    transition: "width 0.2s ease-in-out",
    bg: "green.500",
    "&[dir=rtl]": {
      "--translate-x": "100%",
    },
    "&[data-state=indeterminate]": {
      width: "210%",
      animation: `1s cubic-bezier(0.694, 0.0482, 0.335, 1) 0s infinite normal none running ${animation}`,
    },
  },
})

export function LinearProgress(props: any) {
  const [state, send] = useMachine(progress.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = progress.connect(state, send, normalizeProps)

  return (
    <div>
      <Stack mb="4" {...api.rootProps}>
        <div {...api.labelProps}>Upload progress</div>
        <Track {...api.trackProps}>
          <Range {...api.rangeProps} />
        </Track>
        <div {...api.valueTextProps}>{api.valueAsString}</div>
      </Stack>

      <HStack>
        <Button
          size="sm"
          variant="outline"
          onClick={() => api.setValue((api.value ?? 0) - 20)}
        >
          Decrease
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => api.setValue((api.value ?? 0) + 20)}
        >
          Increase
        </Button>

        <Button size="sm" variant="outline" onClick={() => api.setValue(null)}>
          Indeterminate
        </Button>
      </HStack>
    </div>
  )
}

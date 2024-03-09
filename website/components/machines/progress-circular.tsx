import { HStack, VStack } from "@chakra-ui/layout"
import { chakra, keyframes } from "@chakra-ui/system"
import * as progress from "@zag-js/progress"
import { normalizeProps, useMachine } from "@zag-js/react"
import { Button } from "components/button"
import { useId } from "react"

const spin = keyframes({
  from: { transform: "rotate(0deg)" },
  to: { transform: "rotate(360deg)" },
})

const circleAnimation = keyframes({
  "0%": {
    strokeDasharray: "1, 400",
    strokeDashoffset: "0",
  },
  "100%": {
    strokeDasharray: "400, 400",
    strokeDashoffset: "-260",
  },
})

const Circle = chakra("svg", {
  baseStyle: {
    "--size": "120px",
    "--thickness": "12px",
    "&[data-state=indeterminate]": {
      animation: `${spin} 2s linear infinite`,
    },
  },
})

const CircleTrack = chakra("circle", {
  baseStyle: {
    stroke: "bg-subtle",
  },
})

const CircleRange = chakra("circle", {
  baseStyle: {
    stroke: "green.500",
    transitionProperty: "stroke-dasharray, stroke",
    transitionDuration: "0.6s",
    "&[data-state=indeterminate]": {
      animation: `${circleAnimation} 1.5s ease-in-out infinite`,
    },
  },
})

export function CircularProgress(props: any) {
  const [state, send] = useMachine(progress.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = progress.connect(state, send, normalizeProps)

  return (
    <div>
      <VStack mb="4" spacing="5" {...api.rootProps}>
        <div {...api.labelProps}>Upload progress</div>
        <Circle {...(api.circleProps as any)}>
          <CircleTrack {...(api.circleTrackProps as any)} />
          <CircleRange {...(api.circleRangeProps as any)} />
        </Circle>
        <div {...api.valueTextProps}>{api.valueAsString}</div>
      </VStack>

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

import { chakra, HTMLChakraProps } from "@chakra-ui/system"
import React from "react"

export const NigeriaFlag = (props: HTMLChakraProps<"svg">) => (
  <chakra.svg
    display="inline-block"
    mx="3"
    h="16px"
    w="auto"
    viewBox="0 0 48 48"
    verticalAlign="middle"
    {...props}
  >
    <g>
      <rect x="16" y="6" fill="#E6E6E6" width="16" height="36"></rect>{" "}
      <path
        fill="#078754"
        d="M48,40c0,1.105-0.895,2-2,2H32V6h14c1.105,0,2,0.895,2,2V40z"
      />
      <path
        fill="#078754"
        d="M16,42H2c-1.105,0-2-0.895-2-2V8c0-1.105,0.895-2,2-2h14V42z"
      />
    </g>
  </chakra.svg>
)

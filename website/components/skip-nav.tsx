import { chakra, HTMLChakraProps, SystemStyleObject } from "@chakra-ui/system"

const baseStyle: SystemStyleObject = {
  userSelect: "none",
  border: "0",
  height: "1px",
  width: "1px",
  margin: "-1px",
  padding: "0",
  overflow: "hidden",
  position: "absolute",
  clip: "rect(0 0 0 0)",
  _focus: {
    clip: "auto",
    width: "auto",
    height: "auto",
  },
}

export const SkipNavLink = (props: HTMLChakraProps<"a">) => {
  return (
    <chakra.a
      {...props}
      href="#skip-nav"
      zIndex="banner"
      px="4"
      py="2"
      margin="3"
      bg="green.200"
      __css={baseStyle}
    />
  )
}

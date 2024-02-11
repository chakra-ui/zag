import { chakra } from "@chakra-ui/system"

export const Kbd = chakra("kbd", {
  baseStyle: {
    fontFamily: "mono",
    display: "inline-block",
    paddingX: "0.4em",
    paddingY: "0.1em",
    fontSize: "0.8em",
    fontWeight: "bold",
    backgroundColor: "bg-code-inline",
    color: "pink.600",
    borderWidth: "1px",
    borderTopWidth: "2px",
    borderColor: "border-bold",
    borderRadius: "3px",
  },
})

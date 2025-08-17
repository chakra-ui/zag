import { chakra } from "@chakra-ui/system"
import Link from "next/link"
import { HiArrowRight } from "react-icons/hi"
import { LuPartyPopper } from "react-icons/lu"

const Root = chakra("div", {
  baseStyle: {
    display: "inline-flex",
    alignItems: "center",
    textStyle: "sm",
    gap: "2.5",
    px: "4",
    py: "2",
    fontWeight: "medium",
    bg: "bg-tertiary-bold",
    borderRadius: "4px",
    focusRing: "outside",
    mb: "6",
  },
})

export const Annoucement = () => {
  return (
    <Link href="/components/react/scroll-area">
      <Root alignSelf="flex-start">
        <LuPartyPopper />
        [New] Scroll Area component
        <HiArrowRight />
      </Root>
    </Link>
  )
}

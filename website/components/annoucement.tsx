import Link from "next/link"
import { HiArrowRight } from "react-icons/hi"
import { LuPartyPopper } from "react-icons/lu"
import { styled } from "styled-system/jsx"

const StyledLink = styled(Link, {
  base: {
    alignSelf: "flex-start",
    display: "inline-flex",
    alignItems: "center",
    fontSize: "sm",
    gap: "2.5",
    px: "4",
    py: "2",
    fontWeight: "medium",
    bg: "bg.tertiary.bold",
    borderRadius: "4px",
    focusRing: "outside",
    mb: "6",
  },
})

export const Annoucement = () => {
  return (
    <StyledLink href="/components/react/scroll-area">
      <LuPartyPopper />
      [New] Scroll Area component
      <HiArrowRight />
    </StyledLink>
  )
}

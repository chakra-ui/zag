import { Icon } from "components/ui/icon"
import { HiPencilAlt } from "react-icons/hi"
import { styled } from "styled-system/jsx"

const StyledLink = styled("a", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    gap: "1",
    textStyle: "a",
    fontSize: "sm",
    mt: "14",
  },
})

type EditPageLinkProps = React.ComponentProps<typeof StyledLink>

export const EditPageLink = (props: EditPageLinkProps) => {
  return (
    <StyledLink {...props}>
      <Icon as={HiPencilAlt} />
      {props.children}
    </StyledLink>
  )
}

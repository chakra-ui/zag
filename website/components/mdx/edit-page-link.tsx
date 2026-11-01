import { LuPencilLine } from "react-icons/lu"
import { css } from "styled-system/css"

const linkStyles = css({
  display: "inline-flex",
  alignItems: "center",
  gap: "2",
  textStyle: "sm",
  color: "text.muted",
  transition: "color 0.15s",
  _hover: { color: "text" },
  _focusVisible: {
    outline: "2px solid",
    outlineColor: "green.500",
    outlineOffset: "2px",
  },
})

export function EditPageLink(props: { href: string }) {
  return (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      className={linkStyles}
    >
      <LuPencilLine size={15} aria-hidden />
      Edit this page on GitHub
    </a>
  )
}

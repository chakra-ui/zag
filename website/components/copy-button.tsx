import { Icon } from "components/ui/icon"
import { useState, type JSX } from "react"
import { HiCheck, HiOutlineClipboardCopy } from "react-icons/hi"
import { styled } from "styled-system/jsx"

const StyledButton = styled("button", {
  base: {
    px: "2",
    py: "1",
    gap: "1",
    borderWidth: "1px",
    position: "absolute",
    right: "5",
    top: "3",
    display: "flex",
    alignItems: "center",
    fontSize: "xs",
    bg: "bg.subtle",
    borderColor: "border.subtle",
    cursor: "pointer",
    _hover: { bg: "bg.muted" },
  },
})

export function CopyButton({ content }: { content: string }): JSX.Element {
  const [copied, setCopied] = useState(false)
  const icon = copied ? HiCheck : HiOutlineClipboardCopy
  return (
    <StyledButton
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => setCopied(false), 1000)
      }}
    >
      <Icon as={icon} />
      <span>{copied ? "Copied" : "Copy"}</span>
    </StyledButton>
  )
}

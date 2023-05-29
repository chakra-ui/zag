import Icon from "@chakra-ui/icon"
import { HStack } from "@chakra-ui/layout"
import { useState } from "react"
import { HiCheck, HiOutlineClipboardCopy } from "react-icons/hi"

export function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false)
  const icon = copied ? HiCheck : HiOutlineClipboardCopy
  return (
    <HStack
      px="2"
      py="1"
      spacing="1"
      borderWidth="1px"
      position="absolute"
      right="5"
      top="3"
      as="button"
      type="button"
      fontSize="xs"
      bg="bg-subtle"
      borderColor="border-subtle"
      onClick={() => {
        navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => setCopied(false), 1000)
      }}
    >
      <Icon as={icon} fontSize="md" />
      <span>{copied ? "Copied" : "Copy"}</span>
    </HStack>
  )
}

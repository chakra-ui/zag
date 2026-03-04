"use client"

import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { Icon } from "components/ui/icon"
import type { JSX } from "react"
import { useState } from "react"
import { FaMarkdown } from "react-icons/fa"
import { HiChevronDown, HiExternalLink } from "react-icons/hi"
import { LuCopy, LuCopyCheck } from "react-icons/lu"
import siteConfig from "site.config"
import { css, cva } from "styled-system/css"
import { HStack, Stack } from "styled-system/jsx"

const buttonStyles = cva({
  base: {
    display: "flex",
    alignItems: "center",
    gap: "2",
    borderWidth: "1px",
    rounded: "sm",
    textStyle: "sm",
    fontWeight: "medium",
    height: "8",
    cursor: "pointer",
    bg: "bg",
    color: "text",
    px: "2",
    outline: "0",
  },
})

interface CopyPageWidgetProps {
  slug: string
  content: string
  title?: string
}

const CopyPageButton = ({ slug }: { slug: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      // Use the API to get normalized content with all expansions
      const apiPath = slug.startsWith("/") ? slug.slice(1) : slug
      const response = await fetch(`/api/mdx/${apiPath}`)
      const data = await response.json()

      if (data.content) {
        await navigator.clipboard.writeText(data.content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <button type="button" onClick={handleCopy} className={buttonStyles()}>
      <Icon as={copied ? LuCopyCheck : LuCopy} />
      <span>{copied ? "Copied!" : "Copy Page"}</span>
    </button>
  )
}

type MenuItem = {
  label: string
  icon: React.ComponentType | (() => JSX.Element)
  href?: string
  onClick?: () => void
}

const ActionMenu = ({ slug, title }: { slug: string; title?: string }) => {
  // Use a stable ID based on slug to avoid hydration mismatch
  const stableId = `action-menu-${slug.replace(/[^a-z0-9]/gi, "-")}`
  const service = useMachine(menu.machine, {
    id: stableId,
    positioning: {
      placement: "bottom-end",
    },
  })

  const api = menu.connect(service, normalizeProps)

  const pageUrl = `${siteConfig.url}${slug}`
  const readUrl = encodeURIComponent(
    `Use web browsing to access links and information: ${pageUrl}\n\nI want to ask some questions about ${title || "this documentation"}.`,
  )

  // Use the new API route for MDX content
  const apiPath = slug.startsWith("/") ? slug.slice(1) : slug
  const mdxApiUrl = `/api/mdx/${apiPath}`

  const menuItems: MenuItem[] = [
    {
      label: "View as MDX",
      href: mdxApiUrl,
      icon: FaMarkdown,
    },
    {
      label: "Open in ChatGPT",
      href: `https://chatgpt.com/?hints=search&q=${readUrl}`,
      icon: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
        </svg>
      ),
    },
    {
      label: "Open in Claude",
      href: `https://claude.ai/new?q=${readUrl}`,
      icon: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z" />
        </svg>
      ),
    },
  ]

  return (
    <>
      <button {...api.getTriggerProps()} className={buttonStyles()}>
        <Icon as={HiChevronDown} />
      </button>
      <Portal>
        <div {...api.getPositionerProps()}>
          <Stack
            width="200px"
            zIndex="1000"
            fontSize="sm"
            bg="bg"
            gap="0"
            padding="2"
            isolation="isolate"
            listStyleType="none"
            boxShadow="md"
            outline="0"
            {...api.getContentProps()}
          >
            {menuItems.map((item) => {
              const IconComponent = item.icon
              const itemProps = api.getItemProps({ value: item.label })

              if (item.onClick) {
                return (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    {...itemProps}
                    className={itemStyles}
                  >
                    <Icon as={IconComponent} />
                    <span>{item.label}</span>
                  </button>
                )
              }

              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...itemProps}
                  className={itemStyles}
                >
                  <Icon as={IconComponent} />
                  <span>{item.label}</span>
                  <Icon
                    as={HiExternalLink}
                    ml="auto"
                    fontSize="xs"
                    opacity="0.6"
                  />
                </a>
              )
            })}
          </Stack>
        </div>
      </Portal>
    </>
  )
}

const itemStyles = css({
  px: "0.5rem",
  py: "0.25rem",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "2",
  textDecoration: "none",
  color: "inherit",
  width: "100%",
  bg: "transparent",
  border: "none",
  textAlign: "left",
  _highlighted: {
    bg: "bg.primary.bold",
    color: "white",
  },
})

export const CopyPageWidget = ({
  slug,
  content,
  title,
}: CopyPageWidgetProps) => {
  return (
    <HStack
      gap="0"
      css={{
        spaceX: "-1px",
        "& > *:first-child": {
          borderTopRightRadius: "0!",
          borderBottomRightRadius: "0!",
        },
        "& > *:last-child": {
          borderTopLeftRadius: "0!",
          borderBottomLeftRadius: "0!",
        },
      }}
    >
      <CopyPageButton slug={slug} />
      <ActionMenu slug={slug} title={title} />
    </HStack>
  )
}

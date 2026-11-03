"use client"

import { useState } from "react"
import { FaXTwitter } from "react-icons/fa6"
import { LuCheck, LuLink } from "react-icons/lu"
import siteConfig from "site.config"
import { HStack } from "styled-system/jsx"
import { docAction } from "styled-system/recipes"

export function PostActions(props: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false)
  const url = `${siteConfig.url}/blog/${props.slug}`
  const share = `https://x.com/intent/post?text=${encodeURIComponent(props.title)}&url=${encodeURIComponent(url)}`
  return (
    <HStack gap="2" ms="auto">
      <button
        type="button"
        className={docAction({ size: "sm" })}
        onClick={() => {
          navigator.clipboard?.writeText(url)
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        }}
      >
        {copied ? <LuCheck aria-hidden /> : <LuLink aria-hidden />}
        {copied ? "Copied" : "Copy link"}
      </button>
      <a
        href={share}
        target="_blank"
        rel="noopener noreferrer"
        className={docAction({ size: "sm" })}
      >
        <FaXTwitter aria-hidden />
        Share
      </a>
    </HStack>
  )
}

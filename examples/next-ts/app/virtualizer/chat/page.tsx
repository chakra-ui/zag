"use client"

import { type UIEvent, useCallback, useEffect, useRef, useState } from "react"
import { useListVirtualizer } from "@/hooks/use-virtualizer"

type ChatMessage = {
  id: string
  author: "You" | "Assistant"
  text: string
}

const HISTORY_PAGE_SIZE = 12
const SCROLL_END_THRESHOLD = 120
const HISTORY_LOAD_THRESHOLD = 120

function makeMessage(index: number): ChatMessage {
  const author = index % 4 === 0 ? "You" : "Assistant"
  const detail =
    index % 5 === 0
      ? "This message is intentionally longer so the example exercises dynamic row measurement and anchor correction."
      : "Short update."

  return {
    id: `message-${index}`,
    author,
    text: `${author} message ${index}. ${detail}`,
  }
}

const initialMessages = Array.from({ length: 36 }, (_, index) => makeMessage(index))

function getMessageIndexById(messages: ChatMessage[]) {
  return new Map(messages.map((message, index) => [message.id, index]))
}

export default function Page() {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const didInitialScrollRef = useRef(false)
  const autoHistoryEnabledRef = useRef(false)
  const shouldFollowStreamRef = useRef(false)
  const loadingHistoryRef = useRef(false)
  const streamTimerRef = useRef<number | null>(null)
  const firstMessageIndexRef = useRef(0)
  const nextMessageIndexRef = useRef(initialMessages.length)
  const messagesRef = useRef(initialMessages)
  const messageIndexByIdRef = useRef(getMessageIndexById(initialMessages))

  const [messages, setMessages] = useState(initialMessages)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)

  const indexToKey = useCallback((index: number) => messagesRef.current[index]!.id, [])
  const keyToIndex = useCallback((key: string | number) => messageIndexByIdRef.current.get(String(key)) ?? -1, [])
  const estimatedSize = useCallback(
    (index: number) => ((messagesRef.current[index]?.text.length ?? 0) > 110 ? 112 : 78),
    [],
  )

  const { virtualizer, ref } = useListVirtualizer({
    count: messages.length,
    estimatedSize,
    indexToKey,
    keyToIndex,
    anchorTo: "end",
    followOnAppend: true,
    scrollEndThreshold: SCROLL_END_THRESHOLD,
    overscan: 6,
  })

  const setScrollElementRef = useCallback(
    (element: HTMLDivElement | null) => {
      scrollRef.current = element
      ref(element)
    },
    [ref],
  )

  const scrollToLatest = useCallback(
    (options: { smooth?: boolean } = {}) => {
      if (options.smooth) {
        virtualizer.scrollToEnd({ smooth: true })
        return
      }

      virtualizer.scrollToEnd()

      const element = scrollRef.current
      if (!element) return

      element.scrollTop = Math.max(0, element.scrollHeight - element.clientHeight)
      virtualizer.handleScroll({
        currentTarget: {
          scrollTop: element.scrollTop,
          scrollLeft: element.scrollLeft,
        },
      })
    },
    [virtualizer],
  )

  const scrollToLatestSettled = useCallback(() => {
    let attempts = 0

    const scroll = () => {
      scrollToLatest()
      attempts += 1

      if (attempts < 4) {
        requestAnimationFrame(scroll)
      }
    }

    scroll()
  }, [scrollToLatest])

  const syncMessages = useCallback((nextMessages: ChatMessage[]) => {
    messagesRef.current = nextMessages
    messageIndexByIdRef.current = getMessageIndexById(nextMessages)
    setMessages(nextMessages)
  }, [])

  const prependHistory = useCallback(() => {
    if (loadingHistoryRef.current) return

    loadingHistoryRef.current = true
    setIsLoadingHistory(true)

    window.setTimeout(() => {
      const nextFirstIndex = firstMessageIndexRef.current - HISTORY_PAGE_SIZE
      firstMessageIndexRef.current = nextFirstIndex
      const olderMessages = Array.from({ length: HISTORY_PAGE_SIZE }, (_, offset) =>
        makeMessage(nextFirstIndex + offset),
      )
      const nextMessages = [...olderMessages, ...messagesRef.current]

      messagesRef.current = nextMessages
      messageIndexByIdRef.current = getMessageIndexById(nextMessages)
      virtualizer.prependItems(HISTORY_PAGE_SIZE)
      setMessages(nextMessages)

      loadingHistoryRef.current = false
      setIsLoadingHistory(false)
    }, 200)
  }, [virtualizer])

  const handleTranscriptScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      virtualizer.handleScroll(event)

      if (!autoHistoryEnabledRef.current) return
      if (loadingHistoryRef.current) return
      if (virtualizer.isAtEnd()) return
      if (event.currentTarget.scrollTop > HISTORY_LOAD_THRESHOLD) return

      prependHistory()
    },
    [prependHistory, virtualizer],
  )

  useEffect(() => {
    if (didInitialScrollRef.current) return

    let frame = 0
    let attempts = 0
    let cancelled = false

    const scroll = () => {
      if (cancelled || didInitialScrollRef.current) return
      scrollToLatest()
      attempts += 1

      if (attempts < 4) {
        frame = requestAnimationFrame(scroll)
        return
      }

      if (didInitialScrollRef.current) return
      didInitialScrollRef.current = true
      autoHistoryEnabledRef.current = true
    }

    frame = requestAnimationFrame(scroll)

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [scrollToLatest])

  useEffect(() => {
    return () => {
      if (streamTimerRef.current != null) {
        window.clearInterval(streamTimerRef.current)
      }
    }
  }, [])

  const appendMessage = useCallback(() => {
    const shouldFollow = virtualizer.isAtEnd()
    const nextIndex = nextMessageIndexRef.current
    nextMessageIndexRef.current += 1
    const nextMessages = [...messagesRef.current, makeMessage(nextIndex)]
    syncMessages(nextMessages)
    virtualizer.updateOptions({ count: nextMessages.length })
    if (shouldFollow) {
      requestAnimationFrame(scrollToLatestSettled)
    }
  }, [scrollToLatestSettled, syncMessages, virtualizer])

  const streamReply = useCallback(() => {
    if (streamTimerRef.current != null) return

    shouldFollowStreamRef.current = virtualizer.isAtEnd()
    const id = `stream-${Date.now()}`
    const chunks = [
      "Assistant is composing a streamed response.",
      "Assistant is composing a streamed response. New tokens keep extending the latest row.",
      "Assistant is composing a streamed response. New tokens keep extending the latest row while the viewport remains pinned only when you are already at the latest message.",
    ]
    let chunkIndex = 0

    setIsStreaming(true)
    const nextMessages = [...messagesRef.current, { id, author: "Assistant" as const, text: chunks[0]! }]
    syncMessages(nextMessages)
    virtualizer.updateOptions({ count: nextMessages.length })
    if (shouldFollowStreamRef.current) {
      requestAnimationFrame(scrollToLatestSettled)
    }

    streamTimerRef.current = window.setInterval(() => {
      chunkIndex += 1

      if (chunkIndex >= chunks.length) {
        if (streamTimerRef.current != null) {
          window.clearInterval(streamTimerRef.current)
          streamTimerRef.current = null
        }
        setIsStreaming(false)
        return
      }

      syncMessages(
        messagesRef.current.map((message) => (message.id === id ? { ...message, text: chunks[chunkIndex]! } : message)),
      )
      if (shouldFollowStreamRef.current) {
        requestAnimationFrame(scrollToLatestSettled)
      }
    }, 450)
  }, [scrollToLatestSettled, syncMessages, virtualizer])

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()
  const isAtEnd = virtualizer.isAtEnd()

  return (
    <main style={{ padding: 20, maxWidth: 760, width: "100%", margin: "0 auto" }}>
      <h1>Chat Virtualizer</h1>
      <p style={{ color: "#64748b", fontSize: 14 }}>
        End anchoring keeps prepended history stable, follows appended messages only when already pinned, and preserves
        the latest message while streamed content grows. Scroll near the top to load older messages automatically.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
        <button type="button" onClick={prependHistory} disabled={isLoadingHistory}>
          {isLoadingHistory ? "Loading..." : "Load older messages"}
        </button>
        <button type="button" onClick={appendMessage}>
          Append message
        </button>
        <button type="button" onClick={streamReply} disabled={isStreaming}>
          {isStreaming ? "Streaming..." : "Stream reply"}
        </button>
        <button type="button" onClick={scrollToLatestSettled} disabled={isAtEnd}>
          Jump to latest
        </button>
      </div>

      <div
        ref={setScrollElementRef}
        onScroll={handleTranscriptScroll}
        {...virtualizer.getContainerAriaAttrs()}
        tabIndex={0}
        aria-label="Chat transcript"
        style={{
          ...virtualizer.getContainerStyle(),
          height: 460,
          width: "100%",
          border: "1px solid #cbd5e1",
          borderRadius: 12,
          marginTop: 16,
          background: "#f8fafc",
        }}
      >
        <div style={{ height: totalSize, width: "100%", position: "relative" }}>
          {virtualItems.map((virtualItem) => {
            const message = messages[virtualItem.index]
            if (!message) return null

            const isOwnMessage = message.author === "You"

            return (
              <div
                key={virtualItem.key}
                ref={virtualItem.measureElement}
                data-index={virtualItem.index}
                {...virtualizer.getItemAriaAttrs(virtualItem.index)}
                style={{
                  ...virtualizer.getItemStyle(virtualItem),
                  boxSizing: "border-box",
                  padding: "10px 14px",
                }}
              >
                <article
                  style={{
                    marginLeft: isOwnMessage ? "auto" : 0,
                    maxWidth: "78%",
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: isOwnMessage ? "#2563eb" : "#ffffff",
                    color: isOwnMessage ? "#ffffff" : "#0f172a",
                    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.08)",
                  }}
                >
                  <strong style={{ display: "block", fontSize: 12, marginBottom: 4 }}>{message.author}</strong>
                  <span style={{ lineHeight: 1.5 }}>{message.text}</span>
                </article>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 12, color: "#64748b", fontSize: 13 }}>
        <span>Messages: {messages.length}</span>
        <span>Rendered: {virtualItems.length}</span>
        <span>Distance from end: {Math.round(virtualizer.getDistanceFromEnd())}px</span>
      </div>
    </main>
  )
}

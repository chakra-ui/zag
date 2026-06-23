import { addDomEvent, getComputedStyle, getEventTarget, getWindow } from "@zag-js/dom-query"
import { Direction } from "@zag-js/types"
import { useEffect, useRef } from "react"

export interface ScrollAreaProps {
  onScrollStart?: (e: Event) => void
  onScrollEnd?: (e: Event) => void
  onScroll?: (e: Event) => void
  onScrollChange?: (scrolling: boolean) => void
  onSideReached?: (sides: { top: boolean; right: boolean; bottom: boolean; left: boolean }) => void
  flush?: (fn: VoidFunction) => void
  offset?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
}

function trackScrollArea(node: HTMLElement | null, props: ScrollAreaProps) {
  if (!node) return

  let { onScrollStart, onScrollEnd, onScrollChange, onSideReached, offset = {}, flush } = props
  const { top: topOffset = 0, right: rightOffset = 0, bottom: bottomOffset = 0, left: leftOffset = 0 } = offset

  const win = getWindow(node)
  const computedStyle = getComputedStyle(node)
  const direction = computedStyle.direction as Direction

  const state = {
    scrollTop: 0,
    scrollLeft: 0,
    scrollEndTime: 0,
    scrollTimeout: null as ReturnType<typeof setTimeout> | null,
    width: 0,
    height: 0,
    isScrolling: false,
    sideReached: {
      right: false,
      bottom: false,
      top: true,
      left: true,
    },
  }

  const checkScroll = () => {
    let scrollTop = node.scrollTop
    let scrollLeft = getScrollLeft(node, direction)
    let scrollHeight = node.scrollHeight
    let scrollWidth = node.scrollWidth
    let clientHeight = node.clientHeight
    let clientWidth = node.clientWidth

    state.scrollTop = Math.max(0, Math.min(scrollTop, clientHeight - state.height))
    state.scrollLeft = Math.max(0, Math.min(scrollLeft, clientWidth - state.width))

    const sides = {
      top: scrollTop <= topOffset,
      bottom: Math.abs(scrollHeight - scrollTop - clientHeight) <= bottomOffset,
      left:
        direction === "ltr" ? scrollLeft <= leftOffset : Math.abs(scrollWidth - scrollLeft - clientWidth) <= leftOffset,
      right:
        direction === "ltr"
          ? Math.abs(scrollWidth - scrollLeft - clientWidth) <= rightOffset
          : scrollLeft <= rightOffset,
    }

    if (serializeSides(sides) !== serializeSides(state.sideReached)) {
      onSideReached?.(sides)
      state.sideReached = sides
    }
  }

  const onScroll = (e: Event) => {
    if (getEventTarget(e) !== node) {
      return
    }

    props.onScroll?.(e)

    flush(() => {
      checkScroll()

      if (!state.isScrolling) {
        state.isScrolling = true
        onScrollChange?.(true)
        onScrollStart?.(e)
      }

      let now = Date.now()
      if (state.scrollEndTime <= now + 50) {
        state.scrollEndTime = now + 300

        if (state.scrollTimeout != null) {
          clearTimeout(state.scrollTimeout)
        }

        state.scrollTimeout = setTimeout(() => {
          state.isScrolling = false
          onScrollChange?.(false)
          state.scrollTimeout = null
          onScrollEnd?.(e)
        }, 300)
      }
    })
  }

  const resizeObserver = new win.ResizeObserver((entries) => {
    if (!entries.length) return
    checkScroll()
  })
  resizeObserver.observe(node)

  const cleanupScroll = addDomEvent(node, "scroll", onScroll)
  const cleanupTimeout = () => {
    if (state.scrollTimeout != null) {
      clearTimeout(state.scrollTimeout)
    }
  }

  return () => {
    cleanupScroll()
    cleanupTimeout()
    resizeObserver.unobserve(node)
  }
}

export type RTLOffsetType = "negative" | "positive-descending" | "positive-ascending"

let cachedRTLResult: RTLOffsetType | null = null

function getRTLOffsetType(doc: Document, recalculate: boolean = false): RTLOffsetType {
  if (cachedRTLResult === null || recalculate) {
    const outerDiv = doc.createElement("div")
    const outerStyle = outerDiv.style
    outerStyle.width = "50px"
    outerStyle.height = "50px"
    outerStyle.overflow = "scroll"
    outerStyle.direction = "rtl"

    const innerDiv = doc.createElement("div")
    const innerStyle = innerDiv.style
    innerStyle.width = "100px"
    innerStyle.height = "100px"

    outerDiv.appendChild(innerDiv)
    doc.body.appendChild(outerDiv)

    if (outerDiv.scrollLeft > 0) {
      cachedRTLResult = "positive-descending"
    } else {
      outerDiv.scrollLeft = 1
      if (outerDiv.scrollLeft === 0) {
        cachedRTLResult = "negative"
      } else {
        cachedRTLResult = "positive-ascending"
      }
    }

    doc.body.removeChild(outerDiv)

    return cachedRTLResult
  }

  return cachedRTLResult
}

function serializeSides(sides: { top: boolean; right: boolean; bottom: boolean; left: boolean }) {
  return `t:${sides.top},r:${sides.right},b:${sides.bottom},l:${sides.left}`
}

function getScrollLeft(node: Element, direction: Direction): number {
  let { scrollLeft } = node
  if (direction === "rtl") {
    let { scrollWidth, clientWidth } = node
    switch (getRTLOffsetType(node.ownerDocument)) {
      case "negative":
        scrollLeft = -scrollLeft
        break
      case "positive-descending":
        scrollLeft = scrollWidth - clientWidth - scrollLeft
        break
    }
  }
  return scrollLeft
}

export function useScrollArea(props: ScrollAreaProps) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    return trackScrollArea(ref.current, props)
  }, [props])
  return ref
}

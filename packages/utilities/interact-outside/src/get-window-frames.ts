import { queueBeforeEvent } from "@zag-js/dom-event"

export function getWindowFrames(win: Window) {
  const frames = {
    each(cb: (win: Window) => void) {
      for (let i = 0; i < win.frames?.length; i += 1) {
        const frame = win.frames[i]
        if (frame) cb(frame)
      }
    },

    queueBeforeEvent(event: string, listener: any) {
      const cleanup = new Set<VoidFunction>()
      frames.each((frame) => {
        try {
          cleanup.add(queueBeforeEvent(frame.document, event, listener))
        } catch {}
      })

      return () => {
        try {
          cleanup.forEach((fn) => fn())
        } catch {}
      }
    },

    addEventListener(event: string, listener: any, options?: any) {
      frames.each((frame) => {
        try {
          frame.document.addEventListener(event, listener, options)
        } catch {}
      })

      return () => {
        try {
          frames.removeEventListener(event, listener, options)
        } catch {}
      }
    },

    removeEventListener(event: string, listener: any, options?: any) {
      frames.each((frame) => {
        try {
          frame.document.removeEventListener(event, listener, options)
        } catch {}
      })
    },
  }

  return frames
}

export function getWindowFrames(win: Window) {
  const frames = {
    each(cb: (win: Window) => void) {
      for (let i = 0; i < win.frames?.length; i += 1) {
        const frame = win.frames[i]
        if (frame) cb(frame)
      }
    },
    addEventListener(event: string, listener: any, options?: any) {
      frames.each((frame) => {
        frame.document.addEventListener(event, listener, options)
      })
      return () => {
        frames.removeEventListener(event, listener, options)
      }
    },
    removeEventListener(event: string, listener: any, options?: any) {
      frames.each((frame) => {
        frame.document.removeEventListener(event, listener, options)
      })
    },
  }
  return frames
}

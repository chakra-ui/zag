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
        try {
          frame.document.addEventListener(event, listener, options)
        } catch (err) {
          console.warn(err)
        }
      })
      return () => {
        try {
          frames.removeEventListener(event, listener, options)
        } catch (err) {
          console.warn(err)
        }
      }
    },
    removeEventListener(event: string, listener: any, options?: any) {
      frames.each((frame) => {
        try {
          frame.document.removeEventListener(event, listener, options)
        } catch (err) {
          console.warn(err)
        }
      })
    },
  }
  return frames
}

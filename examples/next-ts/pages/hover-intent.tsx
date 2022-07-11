import { useEffect, useRef, useState } from "react"
import { hoverIntentMachine } from "@zag-js/hover-intent"

export default function Page() {
  const [isOpen, setIsOpen] = useState(true)

  const contentRef = useRef<HTMLDivElement>(null)
  const [exitPoint, setExitPoint] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!isOpen || !exitPoint) return
    const machine = hoverIntentMachine(contentRef.current, {
      debug: true,
      exitPoint,
      placement: "bottom",
      onComplete() {
        setIsOpen(true)
      },
      onCancel() {
        setIsOpen(false)
      },
    })
    machine.start()
    return () => {
      machine.stop()
      setExitPoint(null)
    }
  }, [isOpen, exitPoint])

  return (
    <div style={{ padding: 50 }}>
      <pre>{JSON.stringify({ isOpen })}</pre>
      <button
        onPointerEnter={() => {
          setIsOpen(true)
        }}
        onPointerLeave={(e) => {
          setExitPoint({ x: e.clientX, y: e.clientY })
        }}
      >
        Trigger
      </button>
      <div
        ref={contentRef}
        style={{
          width: 320,
          padding: 10,
          background: "gray",
          marginTop: 20,
        }}
      >
        This package will accept a fromElement or fallback to the document polygon instead. It will also accept a
        toElement or toVirtualElement which allows us to determine the element the user is moving towards
      </div>
    </div>
  )
}

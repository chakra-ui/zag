import { useState } from "react"
import { Swap } from "../components/swap"

export default function Page() {
  const [muted, setMuted] = useState(false)

  return (
    <main className="swap">
      <button onClick={() => setMuted((c) => !c)}>
        <Swap open={muted} fallback={<div>Unmuted</div>}>
          <div>Muted</div>
        </Swap>
      </button>
    </main>
  )
}

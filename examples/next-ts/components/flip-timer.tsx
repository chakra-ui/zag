import React from "react"

export function FlipTimer({ reverse, time }: any) {
  return (
    <div className="container">
      <Digit label="days" value={time.day} reverse={reverse} />
      <Digit label="hours" value={time.hour} reverse={reverse} />
      <Digit label="mins" value={time.minute} reverse={reverse} />
      <Digit label="secs" value={time.second} reverse={reverse} />
    </div>
  )
}

function Digit({ label, value, reverse }: any) {
  const [digit, setDigit] = React.useState(value)
  const [flipped, setFlipped] = React.useState(false)

  const next = nextDigit(label, digit, reverse)

  React.useEffect(() => {
    if (digit !== value) {
      setFlipped(true)
    } else {
      setFlipped(false)
    }
  }, [value, digit])

  const handleTransitionEnd = (): void => {
    setDigit(value)
    setFlipped(false)
  }

  return (
    <div className="wrapper">
      <div className="block">
        <div className="next">{next}</div>
        <div className="current">{digit}</div>
        <div data-flipped={flipped ? "" : undefined} className="flip" onTransitionEnd={handleTransitionEnd}>
          <div className="face face_front">{digit}</div>
          <div className="face face_back">{next}</div>
        </div>
      </div>
      <span>{label}</span>
    </div>
  )
}

function nextDigit(label: string, digit: number, reverse?: boolean) {
  const ranges = {
    days: 366,
    hours: 24,
    mins: 60,
    secs: 60,
    ms: 1000,
  } as any

  const maxVal = ranges[label]

  let nextDigit
  if (reverse) {
    // Counting backwards
    if (digit === 0) {
      nextDigit = maxVal - 1
    } else {
      nextDigit = digit - 1
    }
  } else {
    // Counting forwards
    if (digit === maxVal - 1) {
      nextDigit = 0
    } else {
      nextDigit = digit + 1
    }
  }

  return nextDigit
}

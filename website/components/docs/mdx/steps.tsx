import { guideMeta, steps } from "styled-system/recipes"

export function Steps(props: { children: React.ReactNode }) {
  return <div className={steps()}>{props.children}</div>
}

export function GuideMeta(props: { items: string[] }) {
  return (
    <div className={guideMeta()}>
      {props.items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  )
}
